from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password
from xmoney.models import *

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=30)
    password = serializers.CharField(max_length=128)


class TokenSerializer(serializers.ModelSerializer):

    """
    Serializer for Token model.
    """

    class Meta:
        model = Token
        fields = ('key',)

class SetPasswordSerializer(serializers.Serializer):

    """
    Serializer for changing Django User password.
    """

    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        return super(SetPasswordSerializer, self).__init__(*args, **kwargs)


class UserInfoSerializer(serializers.ModelSerializer):
	"""
	Serializer for User/
	"""
#	profile = serializers.SerializerMethodField()

	class Meta:
		model = User
		#fields = User. ('profile')
		fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'user_permissions', ]

	#def restore_object(self, attrs, instance=None):
	#	attrs['password'] = make_password(attrs['password'])
	#	return super(UserInfoSerializer, self).restore_object(attrs, instance=None)

class UserBasicInfo(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'first_name', 'last_name',]


class TransactionListSerializer(serializers.ModelSerializer):
	class Meta:
		model = Transaction

class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category

class TransactionSerializer(serializers.ModelSerializer):
	#user = UserInfoSerializer(many=True)
	class Meta:
		model = Transaction
		#exclude = ['user']

class UserOptionSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Option



class WalletSerializer(serializers.ModelSerializer):
	contact = serializers.CharField(required=False)
	note = serializers.CharField(required=False)
	account_number = serializers.CharField(required=False)
	
	class Meta:
		model = Wallet

class NoteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Note

class DashboardStatSerializer(serializers.Serializer):
	transaction = serializers.IntegerField()
	income = serializers.IntegerField()
	expense = serializers.IntegerField()

class DashboardStatOverviewSerializer(serializers.Serializer):
	num_of_transaction = serializers.IntegerField()
	num_of_transaction_stat = serializers.CharField()

	income_value = serializers.IntegerField()
	income_stat = serializers.CharField()

	expense_value = serializers.IntegerField()
	expense_stat = serializers.CharField()

	account = serializers.IntegerField()

class AutoCompleteSerializer(serializers.ModelSerializer):
	contents = serializers.CharField()

class UserRegistrationSerializer(serializers.ModelSerializer):

    """
    Serializer for Django User model and most of its fields.
    """

    class Meta:
		model = User
		fields = ('username', 'password', 'email', 'first_name', 'last_name')

class FeedbackSerializer(serializers.ModelSerializer):
	class Meta:
		model = Feedback

