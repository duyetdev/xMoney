from django.conf.urls import patterns, include, url
from . import views as landing_views

urlpatterns = patterns('', 
	url(r'^$', landing_views.Index, name='authBase'),
)
