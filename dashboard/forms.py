from django import forms
from . import models

class Transaction(form.ModelForm):
	class Meta:
		model = models.Transaction
		#fields = []
