import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

class Coffre(models.Model):
    """
    Modèle représentant un coffre personnel d'épargne par objectif.
    Nombre illimité de coffres, 100% gratuit, sans quota ni intérêts.
    """
    STATUT_CHOICES = [
        ('EN_COURS', 'En cours'),
        ('OBJECTIF_ATTEINT', 'Objectif atteint'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proprietaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coffres')
    nom = models.CharField(max_length=150, verbose_name="Nom du coffre")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    montant_objectif = models.PositiveIntegerField(verbose_name="Montant objectif (FCFA)")
    solde_actuel = models.PositiveIntegerField(default=0, verbose_name="Solde actuel (FCFA)")
    
    # Règle importante : Le montant minimal quotidien est défini individuellement par coffre
    minimum_quotidien = models.PositiveIntegerField(default=2000, verbose_name="Minimum quotidien (FCFA)")
    
    # Date cible facultative, sans pénalité ni frais à l'échéance
    date_cible = models.DateField(blank=True, null=True, verbose_name="Date cible")
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='EN_COURS')
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Coffre d'épargne"
        verbose_name_plural = "Coffres d'épargne"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.nom} — {self.solde_actuel} / {self.montant_objectif} FCFA"

    @property
    def progression_pourcentage(self) -> int:
        if not self.montant_objectif:
            return 0
        return min(100, int((self.solde_actuel / self.montant_objectif) * 100))

    @property
    def est_objectif_atteint(self) -> bool:
        return self.solde_actuel >= self.montant_objectif


class Transaction(models.Model):
    """
    Enregistrement financier immuable et idempotent des dépôts et retraits.
    """
    TYPE_CHOICES = [
        ('DEPOT', 'Dépôt'),
        ('RETRAIT', 'Retrait'),
    ]
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('INITIE', 'Initié'),
        ('EN_TRAITEMENT', 'En traitement'),
        ('REUSSI', 'Réussi'),
        ('ECHOUE', 'Échoué'),
        ('ANNULE', 'Annulé'),
        ('EXPIRE', 'Expiré'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_interne = models.CharField(max_length=64, unique=True, db_index=True)
    coffre = models.ForeignKey(Coffre, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    montant = models.PositiveIntegerField(verbose_name="Montant (FCFA)")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    
    # Clé d'idempotence unique garantissant aucun double crédit ou débit
    idempotency_key = models.CharField(max_length=128, unique=True, db_index=True)
    
    mode_paiement = models.CharField(max_length=30, default='MOBILE_MONEY')
    fournisseur_ref = models.CharField(max_length=100, blank=True, null=True)
    numero_mobile_money = models.CharField(max_length=30, blank=True, null=True)
    operateur = models.CharField(max_length=20, blank=True, null=True)
    motif_echec = models.TextField(blank=True, null=True)
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_confirmation = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.reference_interne} ({self.type}) : {self.montant} FCFA [{self.statut}]"


class JournalActivite(models.Model):
    """
    Journal d'audit immuable des événements Kofry.
    """
    TYPE_CHOICES = [
        ('CONNEXION', 'Connexion'),
        ('DECONNEXION', 'Déconnexion'),
        ('CREATION_COFFRE', 'Création de coffre'),
        ('MODIFICATION_COFFRE', 'Modification de coffre'),
        ('DEPOT', 'Dépôt'),
        ('RETRAIT', 'Retrait'),
        ('SUPPRESSION_COFFRE', 'Suppression de coffre'),
        ('CHANGEMENT_MINIMUM', 'Changement du minimum quotidien'),
        ('CHANGEMENT_OBJECTIF', 'Changement d’objectif'),
        ('CHANGEMENT_DATE', 'Changement de date cible'),
        ('OBJECTIF_ATTEINT', 'Objectif atteint'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proprietaire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activites')
    type_action = models.CharField(max_length=40, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    coffre = models.ForeignKey(Coffre, on_delete=models.SET_NULL, null=True, blank=True)
    montant = models.PositiveIntegerField(null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Événement de journal"
        verbose_name_plural = "Journal d'activité"
        ordering = ['-date']

    def __str__(self):
        return f"{self.date.strftime('%d/%m/%Y %H:%M')} — {self.description}"
