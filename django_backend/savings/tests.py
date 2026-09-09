from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import Coffre, Transaction, JournalActivite
from .services import KofryBankingService

class KofryBusinessRulesTestCase(TestCase):
    """
    Suite de tests validant rigoureusement toutes les règles métier Kofry.
    """

    def setUp(self):
        self.proprietaire = User.objects.create_user(
            username='nanga',
            first_name='Nanga',
            password='motdepassesecurise'
        )

        # Création du coffre Achat Ordinateur
        self.coffre = Coffre.objects.create(
            proprietaire=self.proprietaire,
            nom="Achat Ordinateur",
            montant_objectif=350000,
            solde_actuel=180000,
            minimum_quotidien=2000,
            date_cible="2026-10-15"
        )

    def test_creation_coffre_sans_frais_ni_quota(self):
        """Vérifie la création gratuite et sans limite de coffres."""
        for i in range(10):
            Coffre.objects.create(
                proprietaire=self.proprietaire,
                nom=f"Coffre Objectif {i}",
                montant_objectif=100000,
                minimum_quotidien=1000
            )
        self.assertEqual(Coffre.objects.filter(proprietaire=self.proprietaire).count(), 11)

    def test_depot_egal_au_minimum_accepte(self):
        """Vérifie qu'un dépôt égal au minimum quotidien du coffre (2000 FCFA) est accepté."""
        solde_initial = self.coffre.solde_actuel
        tx = KofryBankingService.executer_depot(
            coffre_id=str(self.coffre.id),
            montant=2000,
            idempotency_key="kofry:deposit:TEST_EGAL_MIN"
        )
        self.coffre.refresh_from_db()
        self.assertEqual(tx.statut, 'REUSSI')
        self.assertEqual(self.coffre.solde_actuel, solde_initial + 2000)

    def test_depot_superieur_au_minimum_accepte(self):
        """Vérifie qu'un dépôt supérieur au minimum quotidien (5000 FCFA > 2000 FCFA) est accepté."""
        solde_initial = self.coffre.solde_actuel
        tx = KofryBankingService.executer_depot(
            coffre_id=str(self.coffre.id),
            montant=5000,
            idempotency_key="kofry:deposit:TEST_SUP_MIN"
        )
        self.coffre.refresh_from_db()
        self.assertEqual(self.coffre.solde_actuel, solde_initial + 5000)

    def test_depot_inferieur_au_minimum_strictement_refuse(self):
        """Vérifie qu'un dépôt inférieur au minimum quotidien est STRICTEMENT rejeté."""
        solde_initial = self.coffre.solde_actuel
        with self.assertRaises(ValidationError) as context:
            KofryBankingService.executer_depot(
                coffre_id=str(self.coffre.id),
                montant=1500, # Inférieur à 2000 FCFA
                idempotency_key="kofry:deposit:TEST_INF_MIN"
            )
        
        self.assertIn("Le montant est inférieur au minimum quotidien de ce coffre", str(context.exception))
        self.coffre.refresh_from_db()
        self.assertEqual(self.coffre.solde_actuel, solde_initial)

    def test_idempotence_webhook_depot_aucun_double_credit(self):
        """Vérifie qu'un webhook reçu plusieurs fois ne crédite le coffre qu'une seule fois."""
        solde_initial = self.coffre.solde_actuel
        cle_unique = "kofry:deposit:IDEMPOTENT_TEST_KEY_123"

        # Webhook 1
        tx1 = KofryBankingService.executer_depot(
            coffre_id=str(self.coffre.id),
            montant=5000,
            idempotency_key=cle_unique
        )
        # Webhook 2 (retry réseau)
        tx2 = KofryBankingService.executer_depot(
            coffre_id=str(self.coffre.id),
            montant=5000,
            idempotency_key=cle_unique
        )

        self.coffre.refresh_from_db()
        self.assertEqual(tx1.id, tx2.id)
        # Solde crédité une seule fois (+5000, pas +10000)
        self.assertEqual(self.coffre.solde_actuel, solde_initial + 5000)

    def test_retrait_valide_sans_frais(self):
        """Vérifie qu'un retrait valide est débité sans aucun frais ni pénalité."""
        solde_initial = self.coffre.solde_actuel
        tx = KofryBankingService.executer_retrait(
            coffre_id=str(self.coffre.id),
            montant=50000,
            idempotency_key="kofry:withdrawal:TEST_RET_VALIDE"
        )
        self.coffre.refresh_from_db()
        self.assertEqual(tx.statut, 'REUSSI')
        self.assertEqual(self.coffre.solde_actuel, solde_initial - 50000)

    def test_retrait_superieur_au_solde_refuse(self):
        """Vérifie qu'une tentative de retrait supérieure au solde est bloquée."""
        solde_initial = self.coffre.solde_actuel
        with self.assertRaises(ValidationError) as context:
            KofryBankingService.executer_retrait(
                coffre_id=str(self.coffre.id),
                montant=solde_initial + 10000,
                idempotency_key="kofry:withdrawal:TEST_RET_TROP_GRAND"
            )
        self.assertIn("Solde insuffisant", str(context.exception))
        self.coffre.refresh_from_db()
        self.assertEqual(self.coffre.solde_actuel, solde_initial)

    def test_changement_statut_objectif_atteint(self):
        """Vérifie que le coffre passe automatiquement à OBJECTIF_ATTEINT dès que le solde >= objectif."""
        KofryBankingService.executer_depot(
            coffre_id=str(self.coffre.id),
            montant=170000, # 180 000 + 170 000 = 350 000 (Objectif)
            idempotency_key="kofry:deposit:TEST_OBJECTIF_ATTEINT"
        )
        self.coffre.refresh_from_db()
        self.assertEqual(self.coffre.solde_actuel, 350000)
        self.assertEqual(self.coffre.statut, 'OBJECTIF_ATTEINT')
        self.assertEqual(self.coffre.progression_pourcentage, 100)
