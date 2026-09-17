from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Deal, Stage


class CRMApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='tester',
            password='test-password-123',
        )
        self.validated_stage = Stage.objects.create(name='Validado', order=1)
        self.closing_stage = Stage.objects.create(name='Cierre', order=2)
        self.deal = Deal.objects.create(
            title='Trato de prueba',
            value=1000,
            stage=self.validated_stage,
            owner=self.user,
            created_by=self.user,
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def test_jwt_authentication_returns_tokens(self):
        response = self.client.post(
            '/api/token/',
            {'username': 'tester', 'password': 'test-password-123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_list_stages(self):
        self.authenticate()

        response = self.client.get('/api/stages/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], 'Validado')

    def test_list_deals(self):
        self.authenticate()

        response = self.client.get('/api/deals/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Trato de prueba')

    def test_change_deal_stage(self):
        self.authenticate()

        response = self.client.patch(
            f'/api/deals/{self.deal.id}/change_stage/',
            {'stage_id': self.closing_stage.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, self.closing_stage)
