var xmoneyApplication = angular.module('xmoney-app', ['ngResource','toggle-switch', 'angular-table' ]);
var api = '/api/v1';
var is_debug = true; if (!is_debug) { console.log = function() {} }

Date.prototype.firstDayOfMonth = function(month) {
	var d = this;
	if (month) d.setMonth(month);
	d.setDate(1);
	return d;
}
Date.prototype.lastNDays = function(n) {
	var d = this;
	d.setDate(new Date().getDate()-n);
	return d;
}

xmoneyApplication.config(function($interpolateProvider, $httpProvider) {
	$interpolateProvider.startSymbol('##');
	$interpolateProvider.endSymbol('##');

	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

 });


/* USER API FACTORY
================================================== */
xmoneyApplication.factory('UserApi', ['$resource', function(r){
	return r(api+'/user/', null, {'update': {method: 'PUT'}});
}])


/* ACCOUNT MANAGER CONTROLLER 
=================================================== */
xmoneyApplication.controller('xmoney-account-controller', ['$scope', '$http', 'UserApi', function(scope, http, UserApi){
	// init 
	scope.account = {}

	UserApi.get(function(d){
		scope.user = d;
	});


	var setMessage = function(type, message) {
		if (!scope) return false;
		
		scope.message = {}
		if (type == 'error') {
			scope.message.is_error = true;
			scope.message.error = message;
		} else if (type == 'success') {
			scope.message.is_success = true;
			scope.message.success = message;
		}

		$('.alert-message').fadeOut(3000);
	}

	scope.changePassword = function() {
		if (scope.account.newpass1.length && scope.account.newpass2.length) {
			var data = {
				new_password1: scope.account.newpass1,
				new_password2: scope.account.newpass2,
			}
			http.post(api+'/user/password', data).success(function(d) {
				setMessage('success', 'Password was changed!');
				$('.bs-change-password-modal-lg').modal('hide');
				console.log(d);
			}).error(function(e) {
				console.log(e);
				scope.account.changepassword_error = e;
			})
		} else {
			console.log('Change password modal', 'Password1 or Password2 empty!');
		}
	}


}]);

/* CHANGE FIRST NAME AND LAST NAME OF USER 
=================================================== */
xmoneyApplication.controller('changeUserName', ['$scope', '$http', 'UserApi', function(scope, http, UserApi){
	var setMessage = function(type, message) {
		if (!scope) return false;
		
		scope.message = {}
		if (type == 'error') {
			scope.message.is_error = true;
			scope.message.error = message;
		} else if (type == 'success') {
			scope.message.is_success = true;
			scope.message.success = message;
		}

		$('.alert-message').fadeOut(3000);
	}
	scope.save = function() {
		UserApi.update({}, scope.user).$promise.then(function(d){
			console.log(d);
		});
		$('#change-name').modal('hide');
		setMessage('success', 'Change name success!');	
		
	}
}])

/* MAIN DASHBOARD CONTROLLER 
==================================================== */
xmoneyApplication.controller('xmoney-dashboard-controller', ['$scope', '$http', '$resource', '$log', function(scope, http, resource, log){
	// Dashboard object init 
	scope.dashboard = {}

	scope.date = new Date();

	// New category object 
	scope.dashboard.new_category = {}

	// mode display top stats
	scope.dashboard.stat_overview_mode = 'last30day';
	scope.dashboard.stat_overview_time = {
		start: (new Date()).lastNDays(30),
		end: (new Date()),
	}

	// Notes 
	scope.dashboard.notes = [];

	// List category
	scope.dashboard.category = [];

	scope.dashboard.transaction_today = [];

	var setMessage = function(type, message) {
		if (!scope) return false;
		
		scope.message = {}
		if (type == 'error') {
			scope.message.is_error = true; scope.message.error = message;
		} else if (type == 'success') {
			scope.message.is_success = true; scope.message.success = message;
		}

		$('.alert-message').fadeOut(3000);
	}

	// Today table -----
	scope.dashboard.todayTableConfig = {
		itemsPerPage: 9,
		fillLastPage: true
	}

	// Category switch button
	$(function(){
		var category_default_icon = 'fa-graduation-cap';
		scope.dashboard.category_icon = category_default_icon;
		$('#category-icon').iconpicker({ 
			iconset: 'fontawesome',
			icon: category_default_icon, 
			rows: 6,
			cols: 8,
			placement: 'bottom',
		}).on('change', function(e) {
			console.log("Change icon: ", e.icon);
			scope.dashboard.category_icon = e.icon;
		});

		// Switch button
		
	    scope.$watch('dashboard.transtype_switch', function() {
	      log.info('Selection changed.');
	    });

	    // Calendar middle page 
		// call this from the developer console and you can control both instances
		var calendars = {};
		scope.dashboard.logtable_date = new Date(); //scope.date; // day picker from center calender 
		scope.dashboard.logtable_type = 'month'; // day, month
		$(document).ready( function() {

		    // assuming you've got the appropriate language files,
		    // clndr will respect whatever moment's language is set to.
		    // moment.lang('ru');

		    // here's some magic to make sure the dates are happening this month.
		    var thisMonth = moment().format('YYYY-MM');

		    var eventArray = [
		        { startDate: thisMonth + '-01', endDate: thisMonth + '-31', title: 'Multi-Day Event' },
		        { startDate: thisMonth + '-21', endDate: thisMonth + '-23', title: 'Another Multi-Day Event' }
		    ];


		    // the order of the click handlers is predictable.
		    // direct click action callbacks come first: click, nextMonth, previousMonth, nextYear, previousYear, or today.
		    // then onMonthChange (if the month changed).
		    // finally onYearChange (if the year changed).

		    calendars.clndr1 = $('.cal1').clndr({
		        events: eventArray,
		    //     constraints: {
		    //      startDate: '2014-10-01',
		    //       endDate: '2014-10-15'
		    //     },
		        clickEvents: {
		            click: function(target) {
		                console.log(target);
		                $('.cal1 .today').removeClass('today');
		                $(target.element).addClass('today');
		                scope.dashboard.logtable_date = new Date(Date.parse(target.date));
		                console.log("Picker this day: ", scope.dashboard.logtable_date);
		                //tablelog.load.day(scope.dashboard.logtable_date.getDate(), scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
		               	tablelog.reload();
		               	// console.log("Show category of ", Date.parse(target.date), '/', Date.parse(target.date).getMonth());
		                // if you turn the `constraints` option on, try this out:
		                // if($(target.element).hasClass('inactive')) {
		                //   console.log('not a valid datepicker date.');
		                // } else {
		                //   console.log('VALID datepicker date.');
		                // }
		            },
		            nextMonth: function() {
		                console.log('next month.');
		            },
		            previousMonth: function() {
		                console.log('previous month.');
		            },
		            onMonthChange: function() {
		                console.log('month changed.');
		            },
		            nextYear: function() {
		                console.log('next year.');
		            },
		            previousYear: function() {
		                console.log('previous year.');
		            },
		            onYearChange: function() {
		                console.log('year changed.');
		            }, 
		    
		        },
		        multiDayEvents: {
		            startDate: 'startDate',
		            endDate: 'endDate'
		        },
		        showAdjacentMonths: true,
		        adjacentDaysChangeMonth: false
		    });


		    // bind both clndrs to the left and right arrow keys
		  /*  $(document).keydown( function(e) {
		        if(e.keyCode == 37) {
		            // left arrow
		            calendars.clndr1.next();
		        }
		        if(e.keyCode == 39) {
		            // right arrow
		            calendars.clndr1.previous();
		        }
		    });
		*/		    
		});

		scope.changeLogTableType = function(type) {
			scope.dashboard.logtable_type = type;
			
			// Reload data table 
			tablelog.reload();
		}
	});

	// ------------ LOAD USER -----------------
	http.get(api+'/user').success(function(d){
		scope.user = d;
		console.log('Loaded user', d);
	});
	
	// -------------- LOAD TRANSACTION DATA ---------------
	scope.loadTransactionFromDate = function(day, month, year) {		
		var d = new Date();

		day = day || 0;
		month = month || d.getMonth()+1;
		year = year || d.getFullYear();

		var reqUrl = api+'/transaction/?';
		if (day !== 0)
			reqUrl += 'day='+day +'&';

		reqUrl += 'month='+month+'&year='+year;
		reqUrl += '&killedcache=' + new Date().getTime();

		http.get(reqUrl).success(function(d) {
			if (d) {
				for (var i = 0; i < d.length; ++i) {
					console.log("Load Table Log Data -> ", d[i]);
					d[i].category = getCategoryFromId(d[i].category);
				}
			}
			console.log('Load table log data: ', d);
			scope.dashboard.transaction_today = d;
		});
	}

	var tablelog = {};
	tablelog.load = {
		today: function() {
			console.log('Get today transaction...');
			scope.loadTransactionFromDate(scope.date.getDate(), scope.date.getMonth()+1, scope.date.getFullYear());
		},
		day: function(d,m,y) {
			var d = d || scope.date.getDate();
			var m = m || scope.date.getMonth()+1;
			var y = y || scope.date.getFullYear();
			console.log('Get date transaction...');
			scope.loadTransactionFromDate(d, m, y);
		},
		month: function(m,y) {
			var m = m || scope.date.getMonth()+1;
			var y = y || scope.date.getFullYear();
			console.log('Get month transaction...');
			scope.loadTransactionFromDate(0, m, y);
		}
	};
	tablelog.reload = function() {
		scope.dashboard.logtable_date = scope.dashboard.logtable_date || new Date();
		if (scope.dashboard.logtable_type == 'day') {
			tablelog.load.day(scope.dashboard.logtable_date.getDate(), scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
		} else {
			tablelog.load.month(scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
		}
	}
	
	// Auto load tablelog 
	tablelog.reload();
	

	// Load list category -----------------

	scope.dashboard.category = [];
	scope.dashboard.category_group = {'in':[], 'ex':[]};

	scope.loadCategory = function() {
		http.get(api+'/category/').success(function(d) {
			scope.dashboard.category = d;
			for (i = 0; i < d.length; ++i) {
				if ('in' == d[i].transaction_type)	
					scope.dashboard.category_group.in.push(d[i]);
				else scope.dashboard.category_group.ex.push(d[i]);
			}
			console.log('Loaded list category: ', d);
			console.log('Category: ', scope.dashboard.category_group);
		});
	}
	scope.loadCategory();


	scope.loadStatOverview = function(mode) {
		// Set new date mode
		scope.dashboard.stat_overview_mode = mode;
		
		// Reset start and end date mode
		if (mode === 'last30day') scope.dashboard.stat_overview_time.start = (new Date()).lastNDays(30);
		else if (mode === 'last7day') scope.dashboard.stat_overview_time.start = (new Date()).lastNDays(7);
		
		http.get(api+'/stats/overview?mode='+scope.dashboard.stat_overview_mode).success(function(d){
			$(function(){
				console.log(d);
				scope.dashboard.stat = d;
				var options = {type:"bar",height:"30",barWidth:"4",barSpacing:"1",barColor:"#ffffff",negBarColor:"#eeeeee"}
				
				// last 7 days
				$(".stat-num-of-transaction").sparkline(d.num_of_transaction_stat, options); 
				$(".stat-income-transaction").sparkline(d.income_stat, options); 
				$(".stat-expense-transaction").sparkline(d.expense_stat, options); 
			})
		})
	}
	scope.loadStatOverview(scope.dashboard.stat_overview_mode)


	// ---------------- CATEGORY -------------------

	scope.openCategoryChoose = function() {
		$('.bs-add-transaction-modal-lg').modal('hide');
		$('.bs-choose-category-modal-lg').modal('show');
	}
	scope.openModalNewCategory = function() {
		// reset error log
		scope.dashboard.new_category.error = '';

		// create user 
		scope.dashboard.new_category.user = scope.user.id;

		$('.bs-add-category-modal-lg').modal('show');
		$('.bs-add-transaction-modal-lg').modal('hide');
		$('.bs-choose-category-modal-lg').modal('hide');	
	}

	// ------------ TRANSACTION -------------
	// Transaction object
	scope.dashboard.transaction = {};
	

	// Get category from id 
	var getCategoryFromId = function(cat_id) {
		console.log("Get category from id ", cat_id);
		if (!scope.dashboard.category) {
			console.log("getCategoryFromId -> !scope.dashboard.category -> load()");
			scope.loadCategory();
		}

		for (var i = 0; i < scope.dashboard.category.length; ++i) {
			if (cat_id === scope.dashboard.category[i].id) {
				console.log("getCategoryFromId -> Found category: scope.dashboard.category["+i+"]", scope.dashboard.category[i]);
				return scope.dashboard.category[i];
			}
		}

		console.log("getCategoryFromId -> Not found!");
		return {description: "Other", icon: "", id: 0, text: "Other", transaction_type: "ex", user_id: 0};
	}

	// Repair data to send req
	var repairNewDataTransaction = function(d) {
		scope.dashboard.transaction.data = {
			user: scope.user.id || 0,
			category: {'id': 0, 'text':'Select category', 'icon':'fa-plus'},
		}

		if (d!=null) 
			scope.dashboard.transaction.data = d;

		console.log('Repair data to add new.', scope.dashboard.transaction.data);
	}

	// Open modal add new transaction
	scope.openModalNewTransaction = function() {
		repairNewDataTransaction();

		$('.bs-add-transaction-modal-lg').modal('show');
	}

	// Save new transaction
	scope.saveNewTransaction = function() {
		if (scope.dashboard.transtype_switch == true) 
			var transtype = 'in';
		else
			var transtype = 'ex';
		var data = {
			'user': scope.user.id, 
			'category': scope.dashboard.transaction.data.category.id, 
			'unit': 'vnd', 
			'transaction_type': transtype,
			'value': scope.dashboard.transaction.data.value,
			'note': scope.dashboard.transaction.data.note,
			// ..........
		}
		http.post(api+'/transaction/', data).success(function(d) {
			// Message about success
			setMessage('success', 'Success!')

			// Close modal add transaction
			$('.bs-add-transaction-modal-lg').modal('hide');

			// Reload all data
			scope.loadStatOverview(scope.dashboard.stat_overview_mode);
			repairNewDataTransaction();
			tablelog.reload();
		}).error(function(e){
			console.log('Have some error');
			scope.dashboard.transaction.errors = e;
			console.log(e);
		})
	}


	// Edit transaction
	scope.dashboard.transaction.is_edit = null;
	scope.openModalEditTransaction = function(item) {
		console.log('Open modal editTransaction', item);
		repairNewDataTransaction(item);

		$('.bs-edit-transaction-modal-lg').modal('show');
	}

	scope.editTransaction = function() {
		
	
	}
	
	// Delete transaction
	scope.deleteConfim = function() {
		if (!scope.dashboard.transaction.data) return false;
		// scope.dashboard.edit_transaction
		$('.bs-edit-transaction-modal-lg').modal('hide');
		$('.bs-delete-confirm-modal-lg').modal('show');
	}
	scope.deleteTransaction = function() {
		if (!scope.dashboard.transaction.data) return false;

		var deleted = null;

		http.delete(api+'/transaction/' +scope.dashboard.transaction.data.transaction_id+'/').success(function(d){
			console.log('Delete transaction', d);	
			setMessage('success', 'Delete success!');
			tablelog.reload();
			scope.dashboard.edit_transaction = false;
			// Hide modal
			$('.bs-delete-confirm-modal-lg').modal('hide');
			scope.loadStatOverview(scope.dashboard.stat_overview_mode);
		}).error(function(d){
			setMessage('error', 'Delete transaction was fail!');
			$('.bs-delete-confirm-modal-lg').modal('hide');
		});	


		return false;
	}

	// ------------------- CATEGORY -----------------

	scope.chooseCategory = function(i) {
		scope.dashboard.transaction.data.category = i; 
		console.log('Choose category', scope.dashboard.transaction, 'item', i);
		$('.bs-choose-category-modal-lg').modal('hide');
		$('.bs-add-transaction-modal-lg').modal('show');
	}
	scope.saveNewCategory = function() {
		if (scope.dashboard.new_category.text) {
			if (scope.dashboard.transtype_switch == true) 
				var transtype = 'in';
			else
				var transtype = 'ex';
			var data = {
				'user_id': scope.user.id,
				'transaction_type': transtype,
				'text': scope.dashboard.new_category.text, 
				'icon': scope.dashboard.category_icon,
			}
			http.post(api+'/category/', data).success(function(d){
				scope.dashboard.transaction.data.category = d;

				// Reload category list 
				scope.loadCategory();

				$('.bs-add-category-modal-lg').modal('hide');
				$('.bs-add-transaction-modal-lg').modal('show');
			}).error(function(e){
				scope.dashboard.new_category.error = e;
			});
		}
	}

	// ------------- NOTES ------------------
	scope.dashboard.note = {}

	scope.loadNotesData = function() {
		console.log('Loading notes data ....');
		http.get(api+'/note/').success(function(d) {
			console.log('All notes loaded.');
			scope.dashboard.note.notes = d;
		}).error(function(e) {
			console.log('Load notes error. ', e);
		});
	}
	// Auto load. 
	scope.loadNotesData();

	scope.dashboard.note.listConfig = {
		itemsPerPage: 13,
		fillLastPage: true
	}

	var repairNewDataNote = function(data) {
		scope.dashboard.note.errors = null;

		scope.dashboard.note.data = {
			user: scope.user.id,
			title: '',
			note: '',
			is_active: true,
		}

		if (data != null) 
			scope.dashboard.note.data = data;
	}

	scope.openModalAddNewNote = function() {
		repairNewDataNote();
		$('.bs-add-note-modal-lg').modal('show');
	}

	scope.openModalViewNote = function(item) {
		scope.dashboard.note.viewnote = item;
		$('.bs-view-note-modal-lg').modal('show');
	}

	scope.saveNewNote = function() {
		if (!scope.dashboard.note.data.user) {
			return scope.dashboard.note.errors = {'error': {'message':'System error, please reload application.'}}
		}

		if (!scope.dashboard.note.data.title) {
			return scope.dashboard.note.errors = {'Quick note': {'message': 'This field is required.'}}	
		}

		// Edit note 
		if (scope.dashboard.note.data.is_edit === true) {
			http.put(api+'/note/'+scope.dashboard.note.data.note_id, scope.dashboard.note.data).success(function(d){
				// Reload notes 
				scope.loadNotesData();

				// Hide modal 
				$('.bs-add-note-modal-lg').modal('hide');
			}).error(function(e){
				console.log('Edit note error. ', e);
				scope.dashboard.note.errors = e;
			});

		// Add new here 
		} else {
			http.post(api+'/note/', scope.dashboard.note.data).success(function(d){
				// Reload notes 
				scope.loadNotesData();

				// Hide modal 
				$('.bs-add-note-modal-lg').modal('hide');
			}).error(function(e){
				console.log('Save note error. ', e);
				scope.dashboard.note.errors = e;
			});
		}
	}

	scope.toggleActiveNote = function(note_item) {
		if (!note_item || !note_item.note_id) return false;
		note_item.is_active = !note_item.is_active;
		http.put(api+'/note/' + note_item.note_id+'/', note_item).success(function(d) {
			scope.loadNotesData();
		});
	}

	scope.openModalEditNote = function(item) {
		repairNewDataNote(item);
		scope.dashboard.note.data.is_edit = true;
		$('.bs-add-note-modal-lg').modal('show');
	}

	scope.dashboard.note.delete_item = null;
	scope.openModalDeleteNote = function(item) {
		scope.dashboard.note.delete_item = item;
		$('.bs-delete-note-modal-lg').modal('show');
	}

	scope.deleteNote = function() {
		if (!scope.dashboard.note.delete_item) return false;
		http.delete(api+'/note/' + scope.dashboard.note.delete_item.note_id+'/').success(function(d) {
			scope.loadNotesData();
		}).error(function(e){
			setMessage('error', 'Something was wrong!');
			console.log('Delete note error!');
		});
		$('.bs-delete-note-modal-lg').modal('hide');	
	}

	// ----------------- EVENTS -------------------------------
	scope.openModalChooseEvent = function() {
		$('.bs-choose-event-modal-lg').modal('show');
	}

	// ----------------- IMPORT / EXPORT DATA -----------------
	scope.openModalImportExport = function() {
		$('.bs-import-export-modal-lg').modal('show');
	}



	// ------------- MANAGE CATEGORY -----------------

	// Open modal
	scope.openModalManageCategory = function() {
		$('.bs-manage-category-modal-lg').modal('show');
		$('.bs-add-transaction-modal-lg').modal('hide');
	}

	// Open Modal detail
	scope.openModalEditCategory = function(item) {

	}

		 
}])


/* HELPER PAGE CONTROLLER
============================================================ */

xmoneyApplication.controller('xmoney-helper-controller', ['$scope', '$http', function(scope, http){

}])

/* FEEDBACK CONTROLLER
============================================================= */
xmoneyApplication.controller('xmoney-helper-feedback-controller', ['$scope', '$http', function(scope, http){
	scope.message = {
		messages: '',
		errors: '',
	}
	var resetFeedback = function() {
		scope.feedback_data = {
			user_id: 0,
			errors: '',
			messages: '',
		}
	}
	resetFeedback();

	// User 
	scope.feedback_data.user_id = 0;
	http.get(api+'/user').success(function(d){ 
		scope.feedback_data.user_id = d.id; 
		scope.feedback_data.email = d.email;
		scope.feedback_data.name = d.first_name + ' ' + d.last_name;
	 })

	scope.sendFeedback = function() {
		http.post(api+'/feedback/', scope.feedback_data).success(function(res){
			// Set message
			scope.message.messages = res.message;
			scope.message.errors = '';

			// Clean all 
			resetFeedback();
			$('#feedback-form').slideUp();
			$('.maps-block').slideDown();
		}).error(function(e) {	
			scope.message.errors = e;
			scope.message.message = '';
		});
	}
}])
