"""
Django management command to generate verification codes.

Usage:
    python manage.py generate_codes --count 100
    python manage.py generate_codes --count 50 --prefix 2026
"""

from django.core.management.base import BaseCommand
from apps.authentication.models import VerificationCode
import random


class Command(BaseCommand):
    help = 'Generate verification codes for student registration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of codes to generate (default: 100)'
        )
        parser.add_argument(
            '--prefix',
            type=str,
            default='',
            help='Optional prefix for codes (e.g., "2026" will generate codes like 202601, 202602...)'
        )

    def handle(self, *args, **options):
        count = options['count']
        prefix = options['prefix']

        if prefix and len(prefix) > 4:
            self.stdout.write(self.style.ERROR('Prefix must be 4 characters or less'))
            return

        generated = 0
        attempts = 0
        max_attempts = count * 10  # Prevent infinite loop

        self.stdout.write(f'Generating {count} verification codes...')

        while generated < count and attempts < max_attempts:
            attempts += 1

            if prefix:
                # Generate code with prefix
                remaining_digits = 6 - len(prefix)
                random_part = ''.join([str(random.randint(0, 9)) for _ in range(remaining_digits)])
                code = prefix + random_part
            else:
                # Generate random 6-digit code
                code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

            # Try to create the code (will fail if duplicate)
            try:
                VerificationCode.objects.create(code=code)
                generated += 1

                if generated % 10 == 0:
                    self.stdout.write(f'Generated {generated}/{count} codes...')

            except Exception:
                # Code already exists, try again
                continue

        if generated == count:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully generated {generated} verification codes')
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'Generated {generated}/{count} codes after {attempts} attempts. '
                    f'Some codes may already exist in the database.'
                )
            )

        # Show some example codes
        recent_codes = VerificationCode.objects.filter(is_used=False).order_by('-created_at')[:5]
        if recent_codes:
            self.stdout.write('\nExample unused codes:')
            for code in recent_codes:
                self.stdout.write(f'  - {code.code}')
