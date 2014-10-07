from django.db import models
from datetime import date
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

'''
class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __unicode__(self):
    	return self.question_text

    def was_published_recently(self):
    	return self.pub_date >= timezone.now() - datetime.timedelta(days=1)

    was_published_recently.admin_order_field = 'pub_date'
    was_published_recently.boolean = True
    was_published_recently.short_description = 'Publidasasas?'
'''

class Option(models.Model):
	id = models.AutoField(primary_key=True)
	user = models.ForeignKey(User)
	name = models.CharField(max_length=50)
	value = models.TextField(max_length=250)
	is_active = models.BooleanField(default=True)

	def __unicode__(self):
		return self.value

class Profile(models.Model):
	user = models.ForeignKey(User)
	birthday = models.DateField(blank=True)
	sex = models.CharField(max_length=10)
	
	CHOICE_LANGUAGE_ENGLISH = 'en'
	CHOICE_LANGUAGE_VIETNAMESE = 'vi'
	LANGUAGE_TYPE_CHOICES = ((CHOICE_LANGUAGE_ENGLISH, 'English'), (CHOICE_LANGUAGE_VIETNAMESE, 'Vietnamese'))
	language = models.CharField(max_length=15, choices=LANGUAGE_TYPE_CHOICES, default=CHOICE_LANGUAGE_ENGLISH)

def getAllOptions(user_id):
	return Option.objects.filter(user=user_id)

def getOption(user_id, key):
	opt = Option.objects.filter(user=user_id, name=key)
	if opt is None:
		return ''

	return opt 


def setOption(user_id, key, value):
	opt = Option.objects.filter(user=user_id, name=key)
	if opt:
		opt.value = value
		opt.save()
		return True

	else:
		return Option.objects.create(user=user_id, name=key, value=value, is_active=True)


class Category(models.Model):
	id = models.AutoField(primary_key=True)
	user_id = models.IntegerField(default=0)

	CHOICE_INCOME = 'in'
	CHOICE_EXPENSE = 'ex'
	TRANSACTION_TYPE_CHOICES = ((CHOICE_INCOME, 'income'), (CHOICE_EXPENSE, 'expense'))
	transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPE_CHOICES, default=CHOICE_EXPENSE)
	
	text = models.CharField(max_length=25)
	description = models.CharField(max_length=255, blank=True)
	icon = models.CharField(max_length=255, blank=True)

	def __unicode__(self):
		return self.text

class Wallet(models.Model):
	wallet_id = models.AutoField(primary_key = True)
	user = models.ForeignKey(User)
	name = models.CharField(max_length=50)
	currency = models.CharField(max_length=3)
	contact = models.CharField(max_length=50)
	note = models.CharField(max_length=50)
	account_number = models.CharField(max_length=50)
	is_main = False

	def __unicode__(self):
		return self.name

class Note(models.Model):
	note_id = models.AutoField(primary_key = True)
	user = models.ForeignKey(User)
	title = models.CharField(max_length=50)
	note = models.TextField(max_length=500)
	pub_date = models.DateTimeField()
	is_active = models.BooleanField(default=True)
	
	def __unicode__(self):
		return self.title


class Event(models.Model):
	event_id = models.AutoField(primary_key = True)
	user = models.ForeignKey(User)
	name = models.CharField(max_length=100)
	description = models.CharField(max_length=250)
	pub_date = models.DateTimeField()

	def __unicode__(self):
		return self.name


class Transaction(models.Model):
	transaction_id = models.AutoField(primary_key = True)
	user = models.ForeignKey(User, related_name='userinfo')
	category = models.ForeignKey(Category)
	unit = models.CharField(max_length=3, default='vnd')

	CHOICE_INCOME = 'in'
	CHOICE_EXPENSE = 'ex'
	TRANSACTION_TYPE_CHOICES = ((CHOICE_INCOME, 'income'), (CHOICE_EXPENSE, 'expense'))
	transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPE_CHOICES, default=CHOICE_EXPENSE)
	
	value = models.IntegerField(max_length=250)
	note = models.CharField(max_length=255, blank=True)
	is_repeat = models.BooleanField(default=False)
	repeat_type = models.CharField(max_length=10, default='None', blank=True)
	repeat_from = models.IntegerField(max_length=20, default=0)
	next_repeat = models.DateField(default=date.today())
	with_whom = models.CharField(max_length=50, blank=True)
	date = models.DateField(default=date.today())
	wallet = models.ForeignKey(Wallet,default=0)
	event = models.ForeignKey(Event, default=0)
	photo = ''
	location = ''

	def __unicode__(self):
		return str(self.transaction_id)