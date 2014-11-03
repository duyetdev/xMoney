from django.shortcuts import render, get_object_or_404
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
from django.views import generic
from django.contrib.sites.models import Site
from django.contrib.auth.decorators import login_required

@login_required
def Main(request):
	return render(request, 'helper/base.html', )

def Help(request):
	return render(request, 'helper/help.html', )

def Privacy(request):
	return render(request, 'helper/privacy.html', )

def Feedback(request):
	return render(request, 'helper/feedback.html', )

def Contact(request):
	return render(request, 'helper/contact.html', )

def DMCA(request):
	return render(request, 'helper/dmca.html', )

def Bank(request):
	return render(request, 'helper/bank.html', )

def ChangeLog(request):
	return render(request, 'helper/bank.html', )	

'''
class ResultsView(generic.DetailView):
	context_object_name = 'poll'
	model = Question
	template_name = 'polls/results.html'
'''


'''
def vote(request, poll_id):
	p = get_object_or_404(Question, pk = poll_id)
	try:
		selected_choice = p.choice_set.get(pk=request.POST['choice'])
	except (KeyError, Question.DoesNotExist):
		return render(request, 'polls/detail.html', {
			'poll':p,
			'error_msg': 'You did not select',
		})
	else:
		selected_choice.votes += 1;
		selected_choice.save()

		return HttpResponseRedirect(reverse('polls:results', args=(p.id,)))

 

def Post(request):
	form = PostForm()
	if request.method == "POST":
		form = PostForm(request.POST)
		form.save()
	context = {'form':form}
	return render(request, 'post/index.html', context)


'''