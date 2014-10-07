from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', include('dashboard.urls')),
	#url(r'^$', include('xmoney.urls', namespace = 'auth')),
  	url(r'^accounts/?', include('accounts.urls')),
    url(r'^dashboard/?', include('dashboard.urls')),
    url(r'^landing', include('landing.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'api/', include('api.urls')),
)
