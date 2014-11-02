from django.shortcuts import render_to_response

def Index(request):
	p = {'is_login': request.user.is_authenticated()}
	return render_to_response('landing/index.html', p)