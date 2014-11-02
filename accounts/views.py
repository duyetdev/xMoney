from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, models

from django.conf import settings
from . import forms

####### AUTH BASE #######
def AuthBase(request):
	if not request.user.is_authenticated():
		return redirect('/accounts/login')
	
	p = {}
	return render(request, 'accounts/base.html', p)

####### LOGIN #######
def Login(request):
	redirect_to = request.GET.get('next', '/dashboard')

	if request.user.is_authenticated():
		return redirect(redirect_to)

	state  = ''
	username = password = ''

	if request.POST:
		username = request.POST.get('username', '')
		password = request.POST.get('password', '')
		redirect_to = request.GET.get('next', '/dashboard')

		user = authenticate(username=username, password=password)

		if user is not None:
			if user.is_active:
				login(request, user)
				state = "You're successfully logged in!"
				return render(request, 'accounts/redirect.html', {'next':redirect_to})
			else:
				state = "Your account is not active!"
		else:
			state = "Your username and/or password were incorrect."

	return render(request, 'accounts/login.html', {'state':state, 'username':username})

####### LOGOUT #######
def Logout(request):
	redirect_to = request.GET.get('next', '/accounts/login')
	logout(request)

	return render(request, 'accounts/redirect.html', {'next':redirect_to})

####### REGISTER #######
def Register(request):
	redirect_to = request.GET.get('next', '/dashboard')

	if request.user.is_authenticated():
		return redirect(redirect_to)

	if request.POST:
		user_form = forms.UserForm(data=request.POST)
		if user_form.is_valid():
			user = models.User(username=user_form.cleaned_data['username'], email=user_form.cleaned_data['email'])
			user.set_password(user_form.cleaned_data['password'])
			user.save()

			return render(request, 'accounts/redirect.html', {'next':redirect_to})
		else:
			return render(request, 'accounts/register.html', {'message':user_form.errors, 'user_form':user_form})			
	else:
		user_form = forms.UserForm()
	return render(request, 'accounts/register.html', {'user_form':user_form})

