from django.conf.urls import patterns, include, url
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', include('landing.urls')),
  	url(r'^accounts/?', include('accounts.urls')),
    url(r'^dashboard/?', include('dashboard.urls')),
    url(r'^landing', include('landing.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/', include('api.urls')),
    url(r'^helper/', include('helper.urls')),
)
