from django.contrib import admin
from .models import Coffre, Transaction, JournalActivite

@admin.register(Coffre)
class CoffreAdmin(admin.ModelAdmin):
    list_display = ('nom', 'proprietaire', 'solde_actuel', 'montant_objectif', 'minimum_quotidien', 'statut', 'date_cible')
    list_filter = ('statut', 'date_creation')
    search_fields = ('nom', 'description')
    readonly_fields = ('solde_actuel', 'date_creation', 'date_modification')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference_interne', 'coffre', 'type', 'montant', 'statut', 'date_creation')
    list_filter = ('type', 'statut', 'date_creation')
    search_fields = ('reference_interne', 'idempotency_key', 'fournisseur_ref')
    readonly_fields = ('reference_interne', 'idempotency_key', 'date_creation', 'date_confirmation')

@admin.register(JournalActivite)
class JournalActiviteAdmin(admin.ModelAdmin):
    list_display = ('date', 'type_action', 'description', 'coffre')
    list_filter = ('type_action', 'date')
    search_fields = ('description', 'type_action')
    readonly_fields = ('date', 'type_action', 'description', 'coffre', 'montant')
