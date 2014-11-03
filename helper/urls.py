from django.conf.urls import patterns, url
from . import views as helper_views

urlpatterns = patterns('', 
	url(r'^$', helper_views.Main),	
	url(r'^help/$', helper_views.Help),
	url(r'^privacy/$', helper_views.Privacy),
	url(r'^bank/$', helper_views.Bank),	
	url(r'^feedback/$', helper_views.Feedback),	
	url(r'^contact/$', helper_views.Contact),
	url(r'^dmca/$', helper_views.DMCA),	
	url(r'^changelogs/$', helper_views.Changelogs),	
	url(r'^invite/$', helper_views.Invite),	
)
