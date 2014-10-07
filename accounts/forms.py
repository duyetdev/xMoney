import models
from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _


class UserForm(forms.Form):
    username = forms.RegexField(regex=r'^[\w.@+-]+$',
								max_length=30,
								label=_("Username"),
								error_messages={'invalid': _("This value may contain only letters, numbers and @/./+/-/_ characters.")})
    email = forms.EmailField(label=_("Email"))
    password = forms.CharField(widget=forms.PasswordInput,
								label=_("Password"))
    repassword = forms.CharField(widget=forms.PasswordInput,
								label=_("Password (again)"))

    def clean_username(self):
    	existing = User.objects.filter(username__iexact=self.cleaned_data['username'])
    	if existing.exists():
    		raise forms.ValidationError(_("A user with that username already exists."))
    	else:
    		return self.cleaned_data['username']

    def clean(self):
    	if 'password' in self.cleaned_data and 'repassword' in self.cleaned_data:
    		if self.cleaned_data['password'] != self.cleaned_data['repassword']:
    			raise forms.ValidationError(_("The two password fields didn't match."))
        return self.cleaned_data