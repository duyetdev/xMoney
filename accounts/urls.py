from django.conf.urls import patterns, include, url
#from rest_framework import routers
from . import views as account_views

urlpatterns = patterns('', 
	url(r'^$', account_views.AuthBase, name='authBase'),
	url(r'^login/?$', account_views.Login, name='viewFormLogin'),
	url(r'^logout/?$', account_views.Logout),
	url(r'^register/?$', account_views.Register, name='viewFormRegister'),
	#url(r'^api/$', include(router.urls)),
	#url(r'^login$', front_views.viewFormLogin, name='viewFormLogin'),
	#url(r'^register$', front_views.viewFormRegister, name='viewFormRegister'),
	#url(r'^logout$', front_views.logout, name='Logout'),
)
