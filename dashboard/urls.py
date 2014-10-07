from django.conf.urls import patterns, url
from . import views as dashboard_views

urlpatterns = patterns('', 
	url(r'^$', dashboard_views.Main),		
)
