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

	// New Transaction object
	scope.dashboard.new_transaction = {}

	// mode display top stats
	scope.dashboard.stat_overview_mode = 'last30day';
	scope.dashboard.stat_overview_time = {
		start: (new Date()).lastNDays(30),
		end: (new Date()),
	}


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
			iconset: 'fa',
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
		scope.dashboard.logtable_type = 'day'; // day, month
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
		                tablelog.load.day(scope.dashboard.logtable_date.getDate(), scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
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
			if (type == 'day') {
				tablelog.load.day(scope.dashboard.logtable_date.getDate(), scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
			} else {
				tablelog.load.month(scope.dashboard.logtable_date.getMonth()+1, scope.dashboard.logtable_date.getFullYear());
			}
		}
		
		/*
		$('[name="transtype"]').bootstrapSwitch({
			onColor:'primary', 
			offColor:'warning', 

			onText:'IN', 
			offText:'OUT', 

			animate: true,

			onInit: function(event, state) {
				scope.dashboard.transtype_switch = state
				console.log(event, scope.dashboard.transtype_switch); 
			}
		});

		$('[name="transtype"]').on('switchChange.bootstrapSwitch', function(event, state) {
			console.log(this); // DOM element
			console.log(event); // jQuery event
			console.log(state); // true | false
			scope.dashboard.transtype_switch = state;
			console.log("Switch change: ", scope.dashboard.transtype_switch); 
		});
		*/


	});

	http.get(api+'/user').success(function(d){
		scope.user = d;
		console.log('Loaded user', d);
	})
	
	/*
	http.get(api+'/transaction').success(function(d){
		scope.transaction = d;
		console.log('Loaded list transaction', d);
	});
	*/	

	// -------------- LOAD DATA --------------------
	scope.loadTransactionFromDate = function(day, month, year) {		
		var d = new Date();

		day = day || 0;
		month = month || d.getMonth()+1;
		year = year || d.getFullYear();

		console.log("LOOOOOO", day);

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
	tablelog.load.today();
	

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

	// ------------ ADD NEW TRANSACTION -------------
	var repairNewDataTransaction = function() {
		scope.dashboard.new_transaction = {
			user: scope.user.id || 0,
			category: {'id': 0, 'text':'Select category', 'icon':'fa-plus'},

		}
	}
	scope.openModalNewTransaction = function() {
		repairNewDataTransaction();

		$('.bs-add-transaction-modal-lg').modal('show');
	}

	scope.saveNewTransaction = function() {
		if (scope.dashboard.transtype_switch == true) 
			var transtype = 'in';
		else
			var transtype = 'ex';
		var data = {
			'user': scope.user.id, 
			'category': scope.dashboard.new_transaction.category.id, 
			'unit': 'vnd', 
			'transaction_type': transtype,
			'value': scope.dashboard.new_transaction.value,
			'note': scope.dashboard.new_transaction.note,
			// ..........
		}
		http.post(api+'/transaction/', data).success(function(d) {
			// Message about success
			setMessage('success', 'Success!')

			// Close modal
			$('.bs-add-transaction-modal-lg').modal('hide');

			// Reload all data
			scope.loadStatOverview(scope.dashboard.stat_overview_mode);
			repairNewDataTransaction();
			tablelog.reload();
		}).error(function(e){
			console.log('Have some error');
			scope.dashboard.new_transaction_error = e;
			console.log(e);
		})
	}


	// ------------------- EDIT TRANSACTION ---------------------
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
	scope.openModalEditTransaction = function(item) {
		console.log('openModalEditTransaction', item);
		scope.dashboard.edit_transaction = item;
		scope.dashboard.new_transaction.category = getCategoryFromId(item.category);
		$('.bs-edit-transaction-modal-lg').modal('show');
	}

	scope.editTransaction = function() {
		var data = {

		}

		// Send request to update 

		// If success 
		
		// If error 
		
		// Reset data 
	
	}

	// ------------------- CATEGORY -----------------

	scope.chooseCategory = function(i) {
		scope.dashboard.new_transaction.category = i;
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
				scope.dashboard.new_transaction.category = d;

				// Reload category list 
				scope.loadCategory();

				$('.bs-add-category-modal-lg').modal('hide');
				$('.bs-add-transaction-modal-lg').modal('show');
			}).error(function(e){
				scope.dashboard.new_category.error = e;
			});
		}
	}

	// -------------- DELETE TRANSACTION -----------------

	scope.deleteConfim = function() {
		// scope.dashboard.edit_transaction
		$('.bs-edit-transaction-modal-lg').modal('hide');
		$('.bs-delete-confirm-modal-lg').modal('show');
	}
	scope.deleteTransaction = function() {
		var deleted = null;
		if (scope.dashboard.edit_transaction) {
			http.delete(api+'/transaction/' +scope.dashboard.edit_transaction.transaction_id+'/').success(function(d){
				console.log('Delete transaction', d);	
				setMessage('success', 'Delete success!');
				loadTodayTransaction();
				scope.dashboard.edit_transaction = false;
				// Hide modal
				$('.bs-delete-confirm-modal-lg').modal('hide');
				scope.loadStatOverview(scope.dashboard.stat_overview_mode);
			}).error(function(d){
				setMessage('error', 'Delete transaction was fail!');
				$('.bs-delete-confirm-modal-lg').modal('hide');
			});	
		}

		return false;
	}

	// ----------------- IMPORT / EXPORT DATA -----------------
	scope.openModalImportExport = function() {
		$('.bs-import-export-modal-lg').modal('show');
	}



	// ------------- MANAGE CATEGORY -----------------

	// Open modal
	scope.openModalManageCategory = function() {
		$('.bs-manage-category-modal-lg').modal('show');
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