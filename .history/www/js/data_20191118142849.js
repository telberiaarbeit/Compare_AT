/*
Main JS for tutorial: "Getting Started with HTML5 Local Databases"
Written by Ben Lister (darkcrimson.com) revised May 12, 2010
Tutorial: http://blog.darkcrimson.com/2010/05/local-databases/

Licensed under the MIT License:
http://www.opensource.org/licenses/mit-license.php
*/

$j(function(){ 
	
	var dcoachDB = {
		
		init: function () {
			
			dcoachDB.initDatabase();
			
			$j('#webapp-login').on('click', function(){
				
				if($j('#username').val() != '' && $j('#password').val() != ''){
					dcoachDB.loginCheck(); 
				}
				
			});

			dcoachDB.loginCheck(); 
			
		},

		initDatabase: function() {
			try {
				if (!window.openDatabase) {
					alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');
				} else {
					var shortName = 'WEBAPPDBAP',
					version = '1.0',
					displayName = 'DCOACH DATABASE',
						maxSize = 100000; // in bytes
						
						WEBAPPDBAT = window.openDatabase(shortName, version, displayName, maxSize);
						this.createTables();
					}
				} catch(e) {
					if (e === 2) {
			        // Version mismatch.
			        console.log("Invalid database version.");
			    } else {
			    	console.log("Unknown error "+ e +".");
			    }
			    return;
			} 
		},
		
		/***
		**** CREATE TABLE ** 
		***/
		
		createTables: function() {
			var that = this;
			WEBAPPDBAT.transaction(
				function (transaction) {
					
					//id INTEGER NOT NULL PRIMARY KEY
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_company_attribute(id NUMBER, attribute_id NUMBER, product_id NUMBER, company_id NUMBER, value TEXT, ordering NUMBER);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_product(id NUMBER, product_name VARCHAR, product_description TEXT, product_img VARCHAR, product_reg_date DATE);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_product_attribute(id NUMBER, product_id NUMBER, attribute_name VARCHAR, attribute_id NUMBER, value TEXT, ordering NUMBER);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_product_company(id NUMBER, product_id NUMBER, company_name VARCHAR, product_name VARCHAR, company_reg_date DATE);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_user(id INTEGER NOT NULL PRIMARY KEY, username VARCHAR, password VARCHAR);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_update(id INTEGER NOT NULL PRIMARY KEY, date DATETIME);', [], that.nullDataHandler, that.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS webapp_file_update(id INTEGER NOT NULL PRIMARY KEY, date DATETIME);', [], that.nullDataHandler, that.errorHandler);
					
				}
				);
			
			this.checkUser();
			
			
		},
		
		/***
		**** CHECK USER AVAILABLE ** 
		***/
		
		checkUser: function(){
			var that = this;
			WEBAPPDBAT.transaction(
				function (transaction) {
					transaction.executeSql("SELECT * FROM webapp_user WHERE username != 'user' AND password != 'compare';", [], that.userSelectHandler, that.errorHandler);
				}
				);
		},
		
		/***
		**** CHECK USER AVAILABLE RESULT ** 
		***/
		
		userSelectHandler: function( transaction, results ) {
			
			var i=0,
			row;
			
			if(results.rows.length == 0){
				
				WEBAPPDBAT.transaction(
					function (transaction) {
						//Starter data when page is initialized  				
						transaction.executeSql("DELETE FROM webapp_user", []);
					}
					);
				
				WEBAPPDBAT.transaction(
					function (transaction) {
						//Starter data when page is initialized
						var data = ['user','compare'];  				
						transaction.executeSql("INSERT INTO webapp_user(username, password) VALUES (?, ?)", [data[0], data[1]]);
					}
					);
				
				WEBAPPDBAT.transaction(
					function (transaction) {
						//Starter data when page is initialized
						var newdate = new Date();
						var dataInsertDate = newdate.toLocaleString("de");
						var data = [dataInsertDate];  				
						//transaction.executeSql("INSERT INTO webapp_update(data) VALUES (?)", [data[0]]);
					}
					);
				
			}
			
		},
		
		/***
		**** CHECK USERNAME AND PASSWORD ** 
		***/
		
		loginCheck: function() {
			
			var that = this;
			WEBAPPDBAT.transaction(
				function (transaction) {
					transaction.executeSql("SELECT * FROM webapp_user WHERE username='"+$j('#username').val()+"' AND password='"+$j('#password').val()+"';", [], that.loginMessage, that.errorHandler);
				}
				);
			
		},
		
		/***
		**** USERNAME AND PASSWORD CHECK RESULT ** 
		***/
		
		loginMessage: function( transaction, results ) {
			
			var i=0,
			row;
			
			// if(results.rows.length == 0){
				
			// 	//alert('User not found');
			// 	location.reload();
			
			// } else {
				
			// 	document.addEventListener("online", dcoachDB.downloadInit(), false);
			// 	document.addEventListener("offline", dcoachDB.detailPage(), false);
			
			// }

			document.addEventListener("online", dcoachDB.downloadInit(), false);
			document.addEventListener("offline", dcoachDB.detailPage(), false);
			
		},
		
		/***
		**** REDIRECT TO INSIDE PAGE **
		***/
		
		detailPage: function(){
			
			localStorage.setItem('user', JSON.stringify({user: 'user', password: 'compare'}));				
			window.location.replace('selectproduct.html');
			
		},
		
		/***
		**** DOWNLOAD IMAGE INIT **
		***/
		
		downloadInit: function(){
			
			var url = "http://product.compare.2281008-0401.anx-cus.net/assets/json/product.json";
			var remoteImages = [];
			
			$j.getJSON(url, function(data){
				if(data.length > 0)
				{
					
					for (var d=0; d<data.length; d++) {
						remoteImages.push(data[d]['product_img']);
					}
					
					dcoachDB.downloadImages(remoteImages, 1);
					
				}
			});
			
		},
		
		/***
		**** DOWNLOAD IMAGE **
		***/
		
		downloadImages: function(remoteImages, count) {
			
			var path = cordova.file.dataDirectory;
			var fileTransfer = new FileTransfer();
			var uri = encodeURI("http://product.compare.2281008-0401.anx-cus.net/assets/images/product/"+remoteImages[count-1]);

			fileTransfer.download(
				uri,
				path+"www/img/product/"+remoteImages[count-1],
				function(entry) {
					
					if(count <= remoteImages.length){
						dcoachDB.downloadImages(remoteImages, count+1);
					} else {
						localStorage.setItem('user', JSON.stringify({user: 'user', password: 'compare'}));				
						window.location.replace('selectproduct.html');
					}
					
				},
				function(error) {
					
					if(count <= remoteImages.length){
						dcoachDB.downloadImages(remoteImages, count+1);
					} else {
						localStorage.setItem('user', JSON.stringify({user: 'user', password: 'compare'}));				
						window.location.replace('selectproduct.html');
					}
					
				}
				);

		},
		
		/***
		**** HANDLER ** 
		***/
		
		errorHandler: function( transaction, error ) {
			
			if (error.code===1){
				
				console.log("DB Table already exists");
				
			} else {
				
				console.log('Oops.  Error was '+error.message+' (Code '+ error.code +')');
				
			}
			
			return false;
			
		},
		
		nullDataHandler: function() {
			
			console.log("SQL Query Succeeded");
			
		},
		
	};
	
	dcoachDB.init();
	
});	