from django.conf.urls import patterns, include, url
from rest_framework.authtoken.views import obtain_auth_token
from api import views

urlpatterns = patterns('',
	url(r'^token/', obtain_auth_token, name='api_token'),
	url(r'^user/auth', views.Auth, name='auth'),
	url(r'^option/?$', views.UserOption, name = 'user_option'),
	url(r'^register/?$', views.Register.as_view(), name = 'user_info'),
	url(r'^user/?$', views.UserProfile.as_view(), name = 'user_info'),
	url(r'^user/changepassword?$', views.UserChangePassword, name = 'user_info'),
	url(r'^transaction/$', views.TransactionOverview.as_view()),
	url(r'^transaction/(?P<pk>[0-9]+)/$', views.TransactionAction.as_view(), name='transaction'),
	url(r'^wallet/$', views.Wallet.as_view()),
	url(r'^wallet/(?P<pk>[0-9]+)/$', views.WalletAction.as_view(), name='transaction'),
	#url(r'^statistics/$', views.StatisticsAll),
	url(r'^category/$', views.Category.as_view(), name='list_cat'),
	#url(r'^category/list/$', views.CategoryList.as_view(), name='list_cat'),
	url(r'^category/(?P<pk>[0-9]+)/$', views.CategoryAction.as_view(), name='cat'),
	url(r'^note/$', views.NoteList, name='list_note'),
	url(r'^note/(?P<pk>[0-9]+)/$', views.NoteAction, name='note'),
	url(r'^stats/$', views.DashboardStat, name='dashboard//stat'),
	url(r'^stats/overview$', views.DashboardStatOverview, name='dashboard//stat//transaction'),
	url(r'^stats/(?P<type>[A-z]+)/$', views.DashboardStat, name='dashboard//stat//'),

	url(r'^autocomplete/category$', views.AutoCompleteCategory),
)