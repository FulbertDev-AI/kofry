import uuid
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Coffre, Transaction, JournalActivite

class KofryBankingService:
    """
    Couche de service financière isolée et idempotente pour Kofry.
    Garantit : Une opération demandée = Une seule opération financière réelle = Un seul effet sur le solde.
    """

    @classmethod
    @transaction.atomic
    def executer_depot(
        cls,
        coffre_id: str,
        montant: int,
        idempotency_key: str,
        numero_mobile_money: str = None,
        operateur: str = 'ORANGE',
        fournisseur_ref: str = None,
    ) -> Transaction:
        """
        Crédit atomique et idempotent d'un coffre d'épargne.
        Refuse rigoureusement tout dépôt inférieur au minimum quotidien du coffre.
        """
        # Vérification d'idempotence stricte
        existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
        if existing_tx:
            # Transaction déjà traitée, retourner l'existant sans double crédit
            return existing_tx

        # Verrouillage de la ligne de coffre pour éviter toute concurrence
        coffre = Coffre.objects.select_for_update().get(id=coffre_id)

        if montant <= 0:
            raise ValidationError("Le montant du dépôt doit être strictement positif.")

        # RÈGLE RIGOUREUSE : Vérification du minimum quotidien propre au coffre
        if montant < coffre.minimum_quotidien:
            raise ValidationError(
                f"Le montant est inférieur au minimum quotidien de ce coffre : {coffre.minimum_quotidien:,} FCFA.".replace(',', ' ')
            )

        # Création de la référence unique
        date_str = timezone.now().strftime('%Y%m%d')
        ref_rand = uuid.uuid4().hex[:8].upper()
        reference_interne = f"DEP-{date_str}-{ref_rand}"

        # Enregistrement de la transaction
        tx = Transaction.objects.create(
            reference_interne=reference_interne,
            coffre=coffre,
            type='DEPOT',
            montant=montant,
            statut='REUSSI',
            idempotency_key=idempotency_key,
            mode_paiement='MOBILE_MONEY',
            fournisseur_ref=fournisseur_ref or f"MOMO_PAY_{uuid.uuid4().hex[:8]}",
            numero_mobile_money=numero_mobile_money,
            operateur=operateur,
            date_confirmation=timezone.now(),
        )

        # Mise à jour atomique du solde
        coffre.solde_actuel += montant
        if coffre.solde_actuel >= coffre.montant_objectif:
            coffre.statut = 'OBJECTIF_ATTEINT'
        coffre.save()

        # Enregistrement dans le journal d'activité
        JournalActivite.objects.create(
            proprietaire=coffre.proprietaire,
            type_action='DEPOT',
            description=f"Dépôt de {montant:,} FCFA dans {coffre.nom}".replace(',', ' '),
            coffre=coffre,
            montant=montant,
        )

        return tx

    @classmethod
    @transaction.atomic
    def executer_retrait(
        cls,
        coffre_id: str,
        montant: int,
        idempotency_key: str,
        numero_mobile_money: str = None,
        operateur: str = 'ORANGE',
        fournisseur_ref: str = None,
    ) -> Transaction:
        """
        Débit atomique et idempotent sans AUCUN FRAIS, AUCUNE PÉNALITÉ, NI AUCUN INTÉRÊT.
        """
        # Idempotence
        existing_tx = Transaction.objects.filter(idempotency_key=idempotency_key).first()
        if existing_tx:
            return existing_tx

        # Verrouillage de la ligne pour protection contre double débit
        coffre = Coffre.objects.select_for_update().get(id=coffre_id)

        if montant <= 0:
            raise ValidationError("Le montant du retrait doit être strictement positif.")

        if montant > coffre.solde_actuel:
            raise ValidationError(
                f"Solde insuffisant dans ce coffre. Solde disponible : {coffre.solde_actuel:,} FCFA.".replace(',', ' ')
            )

        # Création de la référence unique
        date_str = timezone.now().strftime('%Y%m%d')
        ref_rand = uuid.uuid4().hex[:8].upper()
        reference_interne = f"RET-{date_str}-{ref_rand}"

        tx = Transaction.objects.create(
            reference_interne=reference_interne,
            coffre=coffre,
            type='RETRAIT',
            montant=montant,
            statut='REUSSI',
            idempotency_key=idempotency_key,
            mode_paiement='MOBILE_MONEY',
            fournisseur_ref=fournisseur_ref or f"MOMO_PAYOUT_{uuid.uuid4().hex[:8]}",
            numero_mobile_money=numero_mobile_money,
            operateur=operateur,
            date_confirmation=timezone.now(),
        )

        # Débit direct du solde (0 FCFA de frais)
        coffre.solde_actuel -= montant
        if coffre.solde_actuel < coffre.montant_objectif:
            coffre.statut = 'EN_COURS'
        coffre.save()

        # Audit
        JournalActivite.objects.create(
            proprietaire=coffre.proprietaire,
            type_action='RETRAIT',
            description=f"Retrait de {montant:,} FCFA depuis {coffre.nom} vers {numero_mobile_money} (0 FCFA de frais)".replace(',', ' '),
            coffre=coffre,
            montant=montant,
        )

        return tx
