#!/usr/bin/env python
"""Utilitaire en ligne de commande Django pour les tâches administratives de Kofry."""
import os
import sys

def main():
    """Exécute les tâches administratives."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Êtes-vous sûr qu'il est installé et disponible dans votre variable d'environnement PYTHONPATH ? "
            "Avez-vous activé l'environnement virtuel ?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
