import unittest
import json
from flask import Flask
from Backend.app import *  # Import your Flask app

class FlaskAPITestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up the test client before running the tests."""
        cls.client = app.test_client()
        cls.client.testing = True

    def test_hello_world(self):
        """Test if the root endpoint returns 'hello world'."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, {"hello": "world"})

    def test_get_all_micronutrients(self):
        """Test the /MicroNutrient endpoint to ensure it returns data."""
        response = self.client.get('/MicroNutrient')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)  # Expecting a list of micronutrients

    def test_get_all_pathologies(self):
        """Test the /Pathology endpoint to ensure it returns data."""
        response = self.client.get('/Pathology')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)  # Expecting a list of pathologies

    def test_get_complements_by_pathology_valid(self):
        """Test if /Pathology/<id> correctly filters data."""
        valid_id = "Diabetes"  # Replace with an actual pathology name in your DB
        response = self.client.get(f'/Pathology/{valid_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)  # Expecting a list of related micronutrients
        if data:  # If there is data, ensure the pathology field matches
            for item in data:
                self.assertEqual(item[0], valid_id)

    def test_get_complements_by_pathology_invalid(self):
        """Test for a non-existing pathology ID."""
        response = self.client.get('/Pathology/NonExistent')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, [])  # Should return an empty list

    def test_sql_injection_protection(self):
        malicious_input = "Diabetes'; DROP TABLE micro_nutrition_cleaned;--"
        response = self.client.get(f'/Pathology/{malicious_input}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)  # Should not execute harmful SQL

if __name__ == '__main__':
    unittest.main()