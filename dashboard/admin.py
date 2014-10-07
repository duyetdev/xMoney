from django.contrib import admin
from models import *


'''
class ChoiceInline(admin.TabularInline):
	model = Choice
	extra = 3

class PollAdmin(admin.ModelAdmin):
	fieldsets = [
		(None,               {'fields': ['question_text']}),
        ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
	]
	inlines = [ChoiceInline]
	list_display = ('question_text', 'pub_date', 'was_published_recently')
	list_filter = ['pub_date']
	search_fields = ['question_text']
	list_per_page = 10
'''

class UsersAdmin(admin.ModelAdmin):
	fieldsets = [

	]

admin.site.register(Option, UsersAdmin)
admin.site.register(Transaction, list_display = ('transaction_id', 'user', 'category', 'note', 'value', 'date', 'wallet'))
admin.site.register(Category)
admin.site.register(Wallet)
admin.site.register(Event)
