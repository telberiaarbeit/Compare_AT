/*
 Main JS for tutorial: "Getting Started with HTML5 Local Databases"
 Written by Ben Lister (darkcrimson.com) revised May 12, 2010
 Tutorial: http://blog.darkcrimson.com/2010/05/local-databases/

 Licensed under the MIT License:
 http://www.opensource.org/licenses/mit-license.php
 */

 $j(function () {

    var dcoachDB = {

        /* OFFLINE INIT */

        offlineInit: function () {


            alert('Internet ist nicht verfügbar');
            $j("#webapp-product-data").listview('refresh');
            $j('#loading-img').css('display', 'none');

            var logindata = JSON.parse(localStorage.getItem('user'));

            if (logindata == null) {

                window.location.replace('login.html');

            } else {

                dcoachDB.initOfflineDatabase();

            }


            $j("#sortable").sortable({
                revert: true

            });

            $j('#webapp-product-sync-row').css('visibility', 'hidden');
            $j('#webapp-product-sync-row').css('position', 'absolute');

            $j('#firsttab').on('click', function () {
                $j("#webapp-product-data").listview('refresh');
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");
            });

            $j('#secondtab').on('click', function () {
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");

            });

            $j('#thirdtab').on('click', function () {
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");

            });


            /* SELECT OPTION */

            $j('#select-choice-1').on('change', function () {

                if ($j("#select-choice-1 option:selected").val() == '1') {

                    $j("#tabs").tabs("option", "active", 5);
                    $j('#fourtab').addClass('ui-tabs-active ui-state-active');

                }


                if ($j("#select-choice-1 option:selected").val() == '3') {

                    /* SYNC Start */

                    dcoachDB.offlineStatusMessage();

                    //dcoachDB.importData('sync');

                    $j('#webapp-product-sync-row').css('visibility', 'hidden');
                    $j('#webapp-product-sync-row').css('position', 'absolute');
                    $j('#fourtab').removeClass('ui-tabs-active ui-state-active');

                    /* SYNC End */

                }


                $j('select[name^="select-choice-1"] option:selected').attr("selected", null);
                $j('select[name^="select-choice-1"] option[value="0"]').attr("selected", "selected");
                $j('#select-choice-1-button span').html($j("#select-choice-1 option:selected").text());


            });

            /* GENERATE PDF EVENT */

            $j('.pdf-pot').on('click', function () {

                document.addEventListener("online", dcoachDB.generateLandPDF(), false);
                document.addEventListener("offline", dcoachDB.generateLandPDF(), false);

            });


            $j('.pdf-land').on('click', function () {

                document.addEventListener("online", dcoachDB.generatePDF(), false);
                document.addEventListener("offline", dcoachDB.generatePDF(), false);

            });


            /* LOGOUT */

            $j('.webapp-footer-link').on('click', function () {
                localStorage.setItem('user', '');
                window.location.replace('login.html');
            });


            /* TO TOP BUTTON */


            $j('#backToTopBtn').on('click', function () {
                $j('#top').animate({scrollTop: $j('#top').offset().top}, "slow");
            });


            

            /* COLUMN SORTABLE */


            $j("#sortable").sortable({
                sort: function () {
                    $j('.webapp-cproduct-value').each(function () {

                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });


                },
                stop: function () {
                    $j('.webapp-cproduct-value').each(function () {

                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });


                },
                update: function () {

                    $j('.webapp-cproduct-value').each(function () {
                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });

                }
            });

            $j('.ui-input-clear').on('click', function () {
                $j('.highlight').each(function () {
                    $j('span').removeClass("highlight");
                });
            });

            dcoachDB.lastUpdate();


            /* PRODUCT COMPANY */


            $j('#webapp-product-data').on('click', '.ui-list-view', function () {

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');


                localStorage.setItem('product-id', $j(this).attr('data-product-id'));
                localStorage.setItem('product-img', $j(this).attr('data-product-img'));
                localStorage.setItem('product-name', $j(this).attr('data-name'));
                var pid = JSON.parse(localStorage.getItem('product-id'));
                var pimg = localStorage.getItem('product-img');
                //var path = window.location.pathname;
                //path = path.substr( path, path.length - 18 );
                var path = cordova.file.dataDirectory;

                $j('.webapp-product-image').html('');
                if (pimg == '') {
                    $j('.webapp-product-image').html('<img src="produktbild.png" style="width:150px; height:auto; display:block;"/>');
                } else {
                    $j('.webapp-product-image').html('<img src="' + path + 'www/img/product/' + pimg + '" style="width:150px; height:auto; display:block;"/>');
                }

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_company WHERE product_id = '" + pid + "';", [], dcoachDB.productCompany, dcoachDB.errorHandler);
                    }
                    );

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_company_attribute;", [], dcoachDB.addCompanyAttribute, dcoachDB.errorHandler);
                    }
                    );

            });


            /* PRODUCT ATTRIBUTE */

            $j('.webapp-product-attr-but').on('click', function () {

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');

                var companycheckvalue = [];
                var companycheckname = [];
                var companycheckpname = [];

                var v = 0;


                $j('#webapp-product-com-list :checked').each(function () {
                    companycheckvalue.push($j(this).val());
                    companycheckname[v] = $j(this).attr('data-company-name');
                    companycheckpname[v] = $j(this).attr('data-cproduct-name');

                    v++;
                });
                localStorage.setItem('company-id', companycheckvalue);
                localStorage.setItem('company-name', companycheckname);
                localStorage.setItem('company-product-name', companycheckpname);

                var pid = JSON.parse(localStorage.getItem('product-id'));

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_attribute WHERE product_id = '" + pid + "';", [], dcoachDB.productAttribute, dcoachDB.errorHandler);
                    }
                    );

            });


            /* PRODUCT COMPARE */

            $j('.webapp-product-compare-but').on('click', function () {

                var attributecheckvalue = [];

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');

                $j('#webapp-product-attr-ul :checked').each(function () {
                    attributecheckvalue.push($j(this).val());
                });

                localStorage.setItem('attribute-id', attributecheckvalue);

                var pid = JSON.parse(localStorage.getItem('product-id'));
                var aid = localStorage.getItem('attribute-id');
                var cid = localStorage.getItem('company-id');


                /* Get Selected Product Arttribute data */
                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_attribute WHERE product_id = '" + pid + "' AND id IN (" + aid + ") ORDER BY ordering ASC;", [], dcoachDB.productSelectAttribute, dcoachDB.errorHandler);
                    }
                    );

                /* Get Selected Company Arttribute data */
                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_company_attribute WHERE product_id='" + pid + "' AND attribute_id IN (" + aid + ") AND company_id IN (" + cid + ") ORDER BY ordering ASC;", [], dcoachDB.companySelectAttribute, dcoachDB.errorHandler);
                    }
                    );


            });

            /* CHECK/UNCHECK CHECKBOX */

            $j('.webapp-button-check').on('click', function () {
                var checkvalue = $j(this).attr('data-check');
                $j('#' + checkvalue + ' li input[type=checkbox]').each(function () {
                    $j(this).prop('checked', true).checkboxradio('refresh');
                });
            });

            $j('.webapp-button-uncheck').on('click', function () {
                var checkvalue = $j(this).attr('data-check');
                $j('#' + checkvalue + ' li input[type=checkbox]').each(function () {
                    $j(this).prop('checked', false).checkboxradio('refresh');
                });
            });

            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-compare-list').on('keyup', function () {

                var regex;
                $j('#four label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-attr-list').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#four label').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-list').on('keyup', function () {

                var regex;
                $j('#one h2').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-data').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#one h2').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-company-list').on('keyup', function () {

                var regex;
                $j('#two label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-attr-ul').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#two label').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-attr-list').on('keyup', function () {

                var regex;
                $j('#three label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-com-list').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#three label').highlightRegex(regex);
                }

            });


        },

        /* ONLINE INIT */

        init: function () {

            $j("#webapp-product-data").listview('refresh');

            var logindata = JSON.parse(localStorage.getItem('user'));

            if (logindata == null) {

                window.location.replace('login.html');

            } else {

                dcoachDB.initDatabase();
            }


            $j("#sortable").sortable({
                revert: true
            });

            $j('#webapp-product-sync-row').css('visibility', 'hidden');
            $j('#webapp-product-sync-row').css('position', 'absolute');

            $j('#firsttab').on('click', function () {
                $j("#webapp-product-data").listview('refresh');
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");
            });

            $j('#secondtab').on('click', function () {
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");

            });

            $j('#thirdtab').on('click', function () {
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                $j("#sortable").sortable("refreshPositions");

            });


            /* SELECT OPTION */

            $j('#select-choice-1').on('change', function () {

                if ($j("#select-choice-1 option:selected").val() == '1') {

                    $j("#tabs").tabs("option", "active", 5);
                    $j('#fourtab').addClass('ui-tabs-active ui-state-active');
                    $j("#select-choice-1 option[value='0']").attr("selected", "selected");

                }


                if ($j("#select-choice-1 option:selected").val() == '3') {

                    /* SYNC Start */

                    $j("#tabs").tabs("option", "active", 4);

                    dcoachDB.importData();

                    $j('#webapp-product-sync-row').css('visibility', 'hidden');
                    $j('#webapp-product-sync-row').css('position', 'absolute');
                    $j('#fourtab').removeClass('ui-tabs-active ui-state-active');
                    $j("#select-choice-1 option[value='0']").attr("selected", "selected");

                    /* SYNC End */

                }

                $j('select[name^="select-choice-1"] option:selected').attr("selected", null);
                $j('select[name^="select-choice-1"] option[value="0"]').attr("selected", "selected");
                $j('#select-choice-1-button span').html($j("#select-choice-1 option:selected").text());


            });


            $j('.topbutton').on('click', function () {

                dcoachDB.importData();

                $j('#webapp-product-sync-row').css('visibility', 'hidden');
                $j('#webapp-product-sync-row').css('position', 'absolute');
                $j('#fourtab').removeClass('ui-tabs-active ui-state-active');

            });
            /* GENERATE PDF EVENT */

            $j('.pdf-pot').on('click', function () {

                document.addEventListener("online", dcoachDB.generateLandPDF(), false);
                //document.addEventListener("offline", dcoachDB.generateLandPDF(), false);

            });


            $j('.pdf-land').on('click', function () {

                document.addEventListener("online", dcoachDB.generatePDF(), false);
                //document.addEventListener("offline", dcoachDB.generatePDF(), false);

            });


            /* LOGOUT */

            $j('.webapp-footer-link').on('click', function () {
                localStorage.setItem('user', '');
                window.location.replace('login.html');
            });


            /* TO TOP BUTTON */


            $j('#backToTopBtn').on('click', function () {
                $j('#top').animate({scrollTop: $j('#top').offset().top}, "slow");
            });


            $j('#top').on('scroll', function (event) {
                    // alert("scrolllinggg body");


                    if ($j('.container-fluid').offset().top < '-390') {

                        $j('.webapp-cproduct-names').css('position', 'fixed').css('top', '0px').css('z-index', '2');
                        $j('.webapp-dproduct-name-0').css('position', 'fixed').css('top', '0px').css('z-index', '2');
                        $j('.webapp-dproduct-name').css('position', 'fixed').css('top', '0px').css('z-index', '2').css('background-color', '#fff').css('width', '100%');



                    // $j('.webapp-cproduct-names').css('position', 'fixed').css('top','0px').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name-0').css('position', 'fixed').css('top','0px').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name').css('position', 'fixed').css('top','0px').css('z-index', '2').css('width', '162px').css('background-color', '#fff');
                    
                    // $j('.webapp-cproduct-names').css('position', 'absolute').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name-0').css('position', 'absolute').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name').css('position', 'absolute').css('z-index', '2').css('width', '162px').css('background-color', '#fff');
                    var topY = (Math.abs($j('.box').offset().top) - Math.abs($j('.box').offset().top));
                    $j('.webapp-cproduct-value').each(function () {

                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left,
                            top: topY
                        });

                    });

                    $j('.webapp-dproduct-name-value').find(".webapp-dproduct-name-0").offset({
                        left: $j(".webapp-dproduct-name-value").offset().left,
                        top: topY
                    });

                    $j('.webapp-dproduct-name-property').find(".webapp-dproduct-name").offset({
                        left: $j(".webapp-dproduct-name-property").offset().left,
                        top: topY
                    });

                } else {
                    $j('.webapp-cproduct-names').css('position', 'relative').css('top', '0').css('z-index', '2');
                    $j('.webapp-dproduct-name-0').css('position', 'relative').css('top', '0').css('z-index', '2');
                    $j('.webapp-dproduct-name').css('position', 'relative').css('top', '0').css('z-index', '2');
                    $j('.webapp-dproduct-name').css('position', 'relative').css('top', '0').css('left', 'auto');
                    $j('.webapp-dproduct-name-0').css('position', 'relative').css('top', '0').css('left', 'auto');
                    $j('.webapp-cproduct-names').css('position', 'relative').css('top', '0').css('left', 'auto');

                    
                    // $j('.webapp-cproduct-names').css('position', 'relative').css('top', '0').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name-0').css('position', 'relative').css('top', '0').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name').css('position', 'relative').css('top', '0').css('z-index', '2').css('width', '162px');
                    // $j('.webapp-dproduct-name').css('position', 'relative').css('top', '0').css('left', 'auto');
                    // $j('.webapp-dproduct-name-0').css('position', 'relative').css('top', '0').css('left', 'auto');
                    // $j('.webapp-cproduct-names').css('position', 'relative').css('top', '0').css('left', 'auto');

                }


                $j('.webapp-cproduct-value').each(function () {
                    var left = $j(this).offset().left;
                    $j(this).find(".webapp-cproduct-names").offset({
                        left: left
                    });

                });

                $j('.webapp-dproduct-name-value').find(".webapp-dproduct-name-0").offset({
                    left: $j(".webapp-dproduct-name-value").offset().left

                });

                $j('.webapp-dproduct-name-property').find(".webapp-dproduct-name").offset({
                    left: $j(".webapp-dproduct-name-property").offset().left
                });

            });

            // $j('.box').on('scroll', function (event) {

            // });


            /* COLUMN SORTABLE */


            $j("#sortable").sortable({
                sort: function () {

                    $j('.webapp-cproduct-value').each(function () {

                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });

                },
                stop: function (event, ui) {
                    $j('.webapp-cproduct-value').each(function () {

                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });
                },
                update: function () {

                    $j('.webapp-cproduct-value').each(function () {
                        var left = $j(this).offset().left;
                        $j(this).find(".webapp-cproduct-names").offset({
                            left: left
                        });
                    });


                }
            });

            $j('.ui-input-clear').on('click', function () {
                $j('.highlight').each(function () {
                    $j('span').removeClass("highlight");
                });
            });

            dcoachDB.lastUpdate();


            /* PRODUCT COMPANY */


            $j('#webapp-product-data').on('click', '.ui-list-view', function () {

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');

                localStorage.setItem('product-id', $j(this).attr('data-product-id'));
                localStorage.setItem('product-img', $j(this).attr('data-product-img'));
                localStorage.setItem('product-name', $j(this).attr('data-name'));
                var pid = JSON.parse(localStorage.getItem('product-id'));
                var pimg = localStorage.getItem('product-img');
                var path = cordova.file.dataDirectory;

                $j('.webapp-product-image').html('');
                if (pimg == '') {
                    $j('.webapp-product-image').html('<img src="produktbild.png" style="width:150px; height:auto; display:block;"/>');
                } else {
                    $j('.webapp-product-image').html('<img src="' + path + 'www/img/product/' + pimg + '" style="width:150px; height:auto; display:block;"/>');
                }

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_company WHERE product_id = '" + pid + "';", [], dcoachDB.productCompany, dcoachDB.errorHandler);
                    }
                    );

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_company_attribute;", [], dcoachDB.addCompanyAttribute, dcoachDB.errorHandler);
                    }
                    );

            });


            /* PRODUCT ATTRIBUTE */

            $j('.webapp-product-attr-but').on('click', function () {

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');

                var companycheckvalue = [];
                var companycheckname = [];
                var companycheckpname = [];

                var v = 0;

                $j('#webapp-product-com-list :checked').each(function () {
                    companycheckvalue.push($j(this).val());
                    companycheckname[v] = $j(this).attr('data-company-name');
                    companycheckpname[v] = $j(this).attr('data-cproduct-name');

                    v++;
                });

                localStorage.setItem('company-id', companycheckvalue);
                localStorage.setItem('company-name', companycheckname);
                localStorage.setItem('company-product-name', companycheckpname);

                var pid = JSON.parse(localStorage.getItem('product-id'));

                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_attribute WHERE product_id = '" + pid + "';", [], dcoachDB.productAttribute, dcoachDB.errorHandler);
                    }
                    );

            });


            /* PRODUCT COMPARE */

            $j('.webapp-product-compare-but').on('click', function () {

                var attributecheckvalue = [];

                $j('.webapp-navbar-tab').find('ul li a.ui-tabs-anchor').removeClass('ui-btn-active');

                $j('#webapp-product-attr-ul :checked').each(function () {
                    attributecheckvalue.push($j(this).val());
                });

                localStorage.setItem('attribute-id', attributecheckvalue);

                var pid = JSON.parse(localStorage.getItem('product-id'));
                var aid = localStorage.getItem('attribute-id');
                var cid = localStorage.getItem('company-id');


                /* Get Selected Product Arttribute data */
                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_product_attribute WHERE product_id = '" + pid + "' AND id IN (" + aid + ") ORDER BY ordering ASC;", [], dcoachDB.productSelectAttribute, dcoachDB.errorHandler);
                    }
                    );

                /* Get Selected Company Arttribute data */
                WEBAPPDB.transaction(
                    function (transaction) {
                        transaction.executeSql("SELECT * FROM webapp_company_attribute WHERE product_id='" + pid + "' AND attribute_id IN (" + aid + ") AND company_id IN (" + cid + ") ORDER BY ordering ASC;", [], dcoachDB.companySelectAttribute, dcoachDB.errorHandler);
                    }
                    );


            });

            /* CHECK/UNCHECK CHECKBOX */

            $j('.webapp-button-check').on('click', function () {
                var checkvalue = $j(this).attr('data-check');
                $j('#' + checkvalue + ' li input[type=checkbox]').each(function () {
                    $j(this).prop('checked', true).checkboxradio('refresh');
                });
            });

            $j('.webapp-button-uncheck').on('click', function () {
                var checkvalue = $j(this).attr('data-check');
                $j('#' + checkvalue + ' li input[type=checkbox]').each(function () {
                    $j(this).prop('checked', false).checkboxradio('refresh');
                });
            });

            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-compare-list').on('keyup', function () {

                var regex;
                $j('#four label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-attr-list').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#four label').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-list').on('keyup', function () {

                var regex;
                $j('#one h2').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-data').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#one h2').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-company-list').on('keyup', function () {

                var regex;
                $j('#two label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-attr-ul').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#two label').highlightRegex(regex);
                }

            });


            /* SEARCH HIGHLIGHTER */


            $j('#webapp-product-attr-list').on('keyup', function () {

                var regex;
                $j('#three label').highlightRegex();
                try {
                    regex = new RegExp($j(this).val(), 'ig')
                }

                catch (e) {
                    $j('#webapp-product-com-list').addClass('error')
                }

                if (typeof regex !== 'undefined') {
                    $j(this).removeClass('error');
                    if ($j(this).val() != '')
                        $j('#three label').highlightRegex(regex);
                }

            });


        },

        /***
         **** IF OFFLINE THEN EXECUTE THIS FUNCTION **
         ***/

         initOfflineDatabase: function () {

            try {

                if (!window.openDatabase) {

                    alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');

                } else {

                    var shortName = 'WEBAPPDB',
                    version = '1.0',
                    displayName = 'DCOACH DATABASE',
                        maxSize = 100000; // in bytes

                        WEBAPPDB = window.openDatabase(shortName, version, displayName, maxSize);

                        var that = this;

                        WEBAPPDB.transaction(
                            function (transaction) {
                                transaction.executeSql("SELECT * FROM webapp_product;", [], dcoachDB.getProducts, dcoachDB.errorHandler);
                            }
                            );

                        $j("#webapp-product-data").listview('refresh');

                    }

                } catch (e) {

                    if (e === 2) {
                    // Version mismatch.
                    console.log("Invalid database version.");
                } else {
                    console.log("Unknown error " + e + ".");
                }
                return;

            }
        },

        /***
         **** IF ONLINE THEN EXECUTE THIS FUNCTION **
         ***/

         initDatabase: function () {

            try {

                if (!window.openDatabase) {

                    alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');

                } else {

                    var shortName = 'WEBAPPDB',
                    version = '1.0',
                    displayName = 'DCOACH DATABASE',
                        maxSize = 100000; // in bytes

                        WEBAPPDB = window.openDatabase(shortName, version, displayName, maxSize);

                        var that = this;

                        WEBAPPDB.transaction(
                            function (transaction) {
                                transaction.executeSql("SELECT * FROM webapp_update;", [], function (transaction, results) {

                                    if (results.rows.length == 0) {

                                        /* ON INIT LOAD DATABASE */
                                        dcoachDB.importData();


                                    } else {


                                        /* NEW UPDATE CHECK */

                                        var i = 0,
                                        row;

                                        var u = 0;

                                        for (var r = 0; r < results.rows.length; r++) {
                                            var updatedate = new Date(results.rows.item(r).date);
                                        }

                                        /* Product last update file information */
                                        var productjson = new Date(urlDate("http://product.compare.2281008-0401.anx-cus.net/assets/json/product.json"));
                                        var productupdatefile = productjson.toLocaleString("de");

                                        console.log(productjson + '--' + updatedate);

                                        if (productjson.valueOf() > updatedate.valueOf()) {
                                            u = u + 1;
                                        }

                                        /* Product attribute last update file information */
                                        var productattributejson = new Date(urlDate("http://product.compare.2281008-0401.anx-cus.net/assets/json/product_attribute.json"));
                                        var productattributeupdatefile = productattributejson.toLocaleString("de");

                                        console.log(productattributejson + '--' + updatedate);

                                        if (productattributejson.valueOf() > updatedate.valueOf()) {
                                            u = u + 1;
                                        }

                                        /* Product company last update file information */
                                        var productcompanyjson = new Date(urlDate("http://product.compare.2281008-0401.anx-cus.net/assets/json/product_company.json"));
                                        var productcompanyupdatefile = productcompanyjson.toLocaleString("de");

                                        console.log(productcompanyjson + '--' + updatedate);

                                        if (productcompanyjson.valueOf() > updatedate.valueOf()) {
                                            u = u + 1;
                                        }

                                        /* Product company last update file information */
                                        var productcompanyattributejson = new Date(urlDate("http://product.compare.2281008-0401.anx-cus.net/assets/json/company_attribute.json"));
                                        var productcompanyupdatefile = productcompanyattributejson.toLocaleString("de");

                                        console.log(productcompanyattributejson + '--' + updatedate);

                                        if (productcompanyattributejson.valueOf() > updatedate.valueOf()) {
                                            u = u + 1;
                                        }

                                        if (u > 0) {

                                            $j('.webapp-product-sync-row').css('visibility', 'visible');
                                            $j('.webapp-product-sync-row').css('position', 'relative');

                                            $j('.webapp-product-sync-content').html('<h4>Es sind neue Daten vom ' + productcompanyattributejson.toLocaleString("de") + ' zum Abrufen bereit</h4>');

                                            $j('#webapp-product-sync-but').on('click', function () {

                                                $j("#tabs").tabs("option", "active", 4);
                                                dcoachDB.importData();

                                            });
                                            alert("Neues Update")

                                        } else {

                                            alert("Kein neues Update");

                                            WEBAPPDB.transaction(
                                                function (transaction) {
                                                    transaction.executeSql("SELECT * FROM webapp_product;", [], dcoachDB.getProducts, dcoachDB.errorHandler);

                                                }
                                                );

                                            $j("#webapp-product-data").listview('refresh');
                                            $j('#loading-img').css('display', 'none');


                                        }

                                        /* NEW UPDATE CHECK */

                                    }
                                    ;

                                });
}
);

}

} catch (e) {

    if (e === 2) {
                    // Version mismatch.
                    console.log("Invalid database version.");
                } else {
                    console.log("Unknown error " + e + ".");
                }
                return;

            }
        },


        /***
         **** INTERNET STATUS **
         ***/

         offlineStatusMessage: function () {

            alert('Bitte verbinden Sie sich mit dem Internet.');
            //$j("#tabs").tabs("option", "active", 0);

        },


        /***
         **** IMPORT DATA **
         ***/

         importData: function () {

            /* INSERT PRODUCT */

            $j('#loading-img').css('display', 'block');

            var that = this;

            var url = "http://product.compare.2281008-0401.anx-cus.net/assets/json/product.json";
            var productdata = [];

            $j.getJSON(url, function (data) {

                if (data.length > 0) {
                    var remoteImages = [];

                    WEBAPPDB.transaction(
                        function (transaction) {
                            transaction.executeSql("DELETE FROM webapp_product", []);
                        }
                        );

                    for (var d = 0; d < data.length; d++) {
                        console.log(data[d]['product_img']);
                        remoteImages.push(data[d]['product_img']);
                        productdata[d] = [data[d]['id'], data[d]['product_name'], data[d]['product_description'], data[d]['product_img'], data[d]['product_reg_date']];

                    }

                    that.downloadImages(remoteImages, 1);

                    WEBAPPDB.transaction(
                        function (transaction) {
                            for (var e = 0; e < productdata.length; e++) {
                                transaction.executeSql("INSERT INTO webapp_product(id, product_name, product_description, product_img, product_reg_date) VALUES (?, ?, ?, ?, ?)", [productdata[e][0], productdata[e][1], productdata[e][2], productdata[e][3], productdata[e][4]]);

                            }
                        }
                        );
                }

            });


            /* INSERT PRODUCT COMPANY */


            var url1 = "http://product.compare.2281008-0401.anx-cus.net/assets/json/product_company.json";
            var productdata1 = [];


            $j.getJSON(url1, function (data) {

                if (data.length > 0) {

                    WEBAPPDB.transaction(
                        function (transaction) {
                            transaction.executeSql("DELETE FROM webapp_product_company", []);
                        }
                        );

                    for (var d = 0; d < data.length; d++) {
                        productdata1[d] = [data[d]['id'], data[d]['product_id'], data[d]['company_name'], data[d]['product_name'], data[d]['company_reg_date']];
                    }

                    WEBAPPDB.transaction(
                        function (transaction) {
                            for (var e = 0; e < productdata1.length; e++) {
                                transaction.executeSql("INSERT INTO webapp_product_company(id, product_id, company_name, product_name, company_reg_date) VALUES (?, ?, ?, ?, ?)", [productdata1[e][0], productdata1[e][1], productdata1[e][2], productdata1[e][3], productdata1[e][4]]);

                            }
                        }
                        );
                }

            });


            /* INSERT PRODUCT ATTRIBUTE */


            var url2 = "http://product.compare.2281008-0401.anx-cus.net/assets/json/product_attribute.json";
            var productdata2 = [];

            $j.getJSON(url2, function (data) {

                if (data.length > 0) {
                    WEBAPPDB.transaction(
                        function (transaction) {
                            transaction.executeSql("DELETE FROM webapp_product_attribute", []);
                        }
                        );

                    for (var d = 0; d < data.length; d++) {
                        productdata2[d] = [data[d]['id'], data[d]['product_id'], data[d]['attribute_name'], data[d]['attribute_id'], data[d]['value'], data[d]['ordering']];
                    }

                    WEBAPPDB.transaction(
                        function (transaction) {

                            for (var e = 0; e < productdata2.length; e++) {
                                transaction.executeSql("INSERT INTO webapp_product_attribute(id, product_id, attribute_name, attribute_id, value, ordering) VALUES (?, ?, ?, ?, ?, ?)", [productdata2[e][0], productdata2[e][1], productdata2[e][2], productdata2[e][3], productdata2[e][4], productdata2[e][5]]);
                            }

                        }
                        );
                }
            });


            /* INSERT COMPANY ATTRIBUTE */


            var url3 = "http://product.compare.2281008-0401.anx-cus.net/assets/json/company_attribute.json";
            var productselecteddata = [];
            var productdata3 = [];


            $j.getJSON(url3, function (data) {

                if (data.length > 0) {

                    WEBAPPDB.transaction(
                        function (transaction) {
                            transaction.executeSql("DELETE FROM webapp_company_attribute", []);
                        }
                        );


                    for (var d = 0; d < data.length; d++) {
                        productdata3[d] = [data[d]['id'], data[d]['attribute_id'], data[d]['product_id'], data[d]['company_id'], data[d]['value'], data[d]['ordering']];
                    }


                    WEBAPPDB.transaction(
                        function (transaction) {
                            for (var e = 0; e < productdata3.length; e++) {
                                transaction.executeSql("INSERT INTO webapp_company_attribute(id, attribute_id, product_id, company_id, value, ordering) VALUES (?, ?, ?, ?, ?, ?)", [productdata3[e][0], productdata3[e][1], productdata3[e][2], productdata3[e][3], productdata3[e][4], productdata3[e][5]]);
                            }
                        }
                        );

                }

            });


            /* INSERT UPDATE DATE */


            var currentdate = new Date();
            WEBAPPDB.transaction(
                function (transaction) {
                    transaction.executeSql("DELETE FROM webapp_update", []);
                    transaction.executeSql("INSERT INTO webapp_update(date) VALUES (?)", [currentdate]);
                    $j('.webapp-product-sync-row').css('visibility', 'hidden');
                    $j('.webapp-product-sync-row').css('position', 'absolute');
                    $j("#webapp-product-data").listview('refresh');
                    $j("#tabs").tabs("option", "active", 0);
                }
                );


            /* UPDATE FOOTER DATE */


            WEBAPPDB.transaction(
                function (transaction) {
                    transaction.executeSql("SELECT * FROM webapp_update;", [], function (transaction, results) {

                        if (results.rows.length != 0) {

                            for (var r = 0; r < results.rows.length; r++) {
                                var updatedate = new Date(results.rows.item(r).date);
                            }
                            var dataUpdateDate = updatedate.toLocaleString("de");

                            $j('.webapp-last-update-date').html(dataUpdateDate);

                        }
                    });
                }
                );


            /* UPDATE END */

        },


        /***
         **** DOWNLOAD IMAGE **
         ***/

         downloadImages: function (remoteImages, count) {

            var path = cordova.file.dataDirectory;
            var fileTransfer = new FileTransfer();
            var uri = encodeURI("http://product.compare.2281008-0401.anx-cus.net/assets/images/product/" + remoteImages[count - 1]);

            fileTransfer.download(
                uri,
                path + "www/img/product/" + remoteImages[count - 1],
                function (entry) {
                    if (count <= remoteImages.length) {
                        console.log('Image Download');
                        dcoachDB.downloadImages(remoteImages, count + 1);
                    } else {
                        console.log('Done');
                        WEBAPPDB.transaction(
                            function (transaction) {
                                transaction.executeSql("SELECT * FROM webapp_product;", [], dcoachDB.getProducts, dcoachDB.errorHandler);

                            }
                            );

                        $j("#webapp-product-data").listview('refresh');
                    }
                },
                function (error) {
                    if (count <= remoteImages.length) {
                        console.log('Image Download');
                        dcoachDB.downloadImages(remoteImages, count + 1);
                    } else {
                        console.log('Done');
                        WEBAPPDB.transaction(
                            function (transaction) {
                                transaction.executeSql("SELECT * FROM webapp_product;", [], dcoachDB.getProducts, dcoachDB.errorHandler);

                            }
                            );

                        $j("#webapp-product-data").listview('refresh');
                        $j('#loading-img').css('display', 'none');
                    }
                }
                );

        },


        /***
         **** GET PRODUCT LIST **
         ***/

         getProducts: function (transaction, results) {

            var i = 0,
            row;

            var product_array = [];

            if (results.rows.length > 0) {

                for (var i = 0; i < results.rows.length; i++) {
                    product_array[i] = {
                        id: [results.rows.item(i).id],
                        product_name: [results.rows.item(i).product_name],
                        product_description: [results.rows.item(i).product_description],
                        product_img: [results.rows.item(i).product_img],
                        product_reg_date: [results.rows.item(i).product_reg_date]
                    };
                }


                localStorage.setItem('products', JSON.stringify(product_array));
                items = JSON.parse(localStorage.getItem('products'));
                $j('#webapp-product-data').html('');
                $j.each(items, $j.proxy(function (i, item) {
                    ///var path = window.location.pathname;
                    //path = path.substr( path, path.length - 18 );
                    var path = cordova.file.dataDirectory;
                    if (item.product_img == '') {
                        $j('#webapp-product-data').append('<li class="ui-li-has-thumb"><a data-index="1" data-product-id="' + item.id + '" data-product-img="' + item.product_img + '" data-name="' + item.product_name + '" data-ajax="false" class="ui-list-view ui-btn ui-btn-icon-right ui-icon-carat-r"><img src="img/produktbild.png" /><h2>' + item.product_name + '</h2></a></li>');
                    } else {
                        $j('#webapp-product-data').append('<li class="ui-li-has-thumb"><a data-index="1" data-product-id="' + item.id + '" data-product-img="' + item.product_img + '" data-name="' + item.product_name + '" data-ajax="false" class="ui-list-view ui-btn ui-btn-icon-right ui-icon-carat-r"><img src="' + path + 'www/img/product/' + item.product_img + '" /><h2>' + item.product_name + '</h2></a></li>');
                    }
                }, $j('#webapp-product-data')));

                console.log('Test');
                $j('#loading-img').css('display', 'none');
                $j("#webapp-product-data").listview('refresh');

            }

        },


        /***
         **** GET PRODUCT COMPANY **
         ***/

         productCompany: function (transaction, results) {

            var i = 0,
            row;

            var product_com_array = [];

            if (results.rows.length > 0) {


                for (var i = 0; i < results.rows.length; i++) {
                    product_com_array[i] = {
                        id: [results.rows.item(i).id],
                        product_id: [results.rows.item(i).product_id],
                        company_name: [results.rows.item(i).company_name],
                        product_name: [results.rows.item(i).product_name],
                        company_reg_date: [results.rows.item(i).company_reg_date]
                    };
                }

                //alert(JSON.stringify(product_com_array));

                localStorage.setItem('product-company', JSON.stringify(product_com_array));
                items = JSON.parse(localStorage.getItem('product-company'));

                $j('#webapp-product-com-list').html('');

                $j.each(items, $j.proxy(function (i, item) {

                    $j('#webapp-product-com-list').append('<li class="ui-li-has-thumb ui-first-child"><div class="ui-checkbox"><label for="checkbox-enhanced" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off">' + item.product_name + '</label><input type="checkbox" webapp-product-company-value[] id="checkbox-enhanced" data-enhanced="true" value="' + item.id + '" data-company-name="' + item.product_name + '" data-cproduct-name="' + item.company_name + '"></div></li>');
                    $j('#webapp-product-com-list li input[type=checkbox]').checkboxradio().trigger('create');


                }, $j('#webapp-product-com-list')));


                $j('.webapp-product-title').html('');
                $j('.webapp-product-title').html('<h4>' + localStorage.getItem('product-name') + '</h4>');


                $j("#webapp-product-com-list").listview('refresh');
                $j("#tabs").tabs("option", "active", 1);


            }

        },

        /***
         **** GET PRODUCT ATTRIBUTES **
         ***/

         productAttribute: function (transaction, results) {

            var i = 0,
            row;

            var product_attr_attry = [];

            if (results.rows.length > 0) {


                for (var i = 0; i < results.rows.length; i++) {
                    product_attr_attry[i] = {
                        id: [results.rows.item(i).id],
                        product_id: [results.rows.item(i).product_id],
                        attribute_name: [results.rows.item(i).attribute_name],
                        attribute_id: [results.rows.item(i).attribute_id],
                        value: [results.rows.item(i).value],
                        ordering: [results.rows.item(i).ordering]
                    };
                }

                localStorage.setItem('product-attribute', JSON.stringify(product_attr_attry));
                items = JSON.parse(localStorage.getItem('product-attribute'));

                $j('#webapp-product-attr-ul').html('');

                $j.each(items, $j.proxy(function (i, item) {

                    $j('#webapp-product-attr-ul').append('<li class="ui-li-has-thumb ui-first-child"><div class="ui-checkbox"><label for="checkbox-enhanced" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off">' + item.attribute_name + '</label><input type="checkbox" name="webapp-product-attr-value[]" id="checkbox-enhanced" data-enhanced="true" value="' + item.id + '"></div></li>');
                    $j('#webapp-product-attr-ul input[type=checkbox]').checkboxradio().trigger('create');


                }, $j('#webapp-product-attr-ul')));


                $j('.webapp-product-title').html('');
                $j('.webapp-product-title').html('<h4>' + localStorage.getItem('product-name') + '</h4>');


                $j("#webapp-product-attr-ul").listview('refresh');
                $j("#tabs").tabs("option", "active", 2);


            }


        },

        /***
         **** GET SELECT PRODUCT ATTRIBUTES LIST **
         ***/

         productSelectAttribute: function (transaction, results) {

            var i = 0,
            row;
            var productselecteddata = [];

            if (results.rows.length > 0) {

                for (var i = 0; i < results.rows.length; i++) {
                    productselecteddata[i] = {
                        id: [results.rows.item(i).id],
                        product_id: [results.rows.item(i).product_id],
                        attribute_name: [results.rows.item(i).attribute_name],
                        attribute_id: [results.rows.item(i).attribute_id],
                        value: [results.rows.item(i).value],
                        ordering: [results.rows.item(i).ordering]
                    };
                }

                localStorage.setItem('product-selected-attribute-value', JSON.stringify(productselecteddata));


            }


        },

        addCompanyAttribute: function (transaction, results) {

            var i = 0,
            row;


        },


        companySelectAttribute: function (transaction, results) {

            $j("#sortable").sortable("refresh");
            $j("#sortable").sortable("refreshPositions");

            var i = 0,
            row;

            var selectedCompanyArray = localStorage.getItem('company-id');
            var selectedCompany = selectedCompanyArray.split(",");
            var selectedProductAttribute = JSON.parse(localStorage.getItem('product-selected-attribute-value'));
            comapany_name_array = localStorage.getItem('company-name');
            comapany_product_name_array = localStorage.getItem('company-product-name');
            product_name_array = localStorage.getItem('product-name');
            var company_name = comapany_name_array.split(",");
            var company_product_name = comapany_product_name_array.split(",");
            var sortablewidth = (selectedCompany.length * 162) + 325;
            $j("#sortable").width(sortablewidth)

            var companyselecteddata = [];

            if (results.rows.length > 0) {

                for (var i = 0; i < results.rows.length; i++) {
                    companyselecteddata[i] = {
                        id: [results.rows.item(i).id],
                        attribute_id: [results.rows.item(i).attribute_id],
                        product_id: [results.rows.item(i).product_id],
                        company_id: [results.rows.item(i).company_id],
                        value: [results.rows.item(i).value],
                        ordering: [results.rows.item(i).ordering]
                    };
                }

                localStorage.setItem('product-selected-company-attribute-value', JSON.stringify(companyselecteddata));


                var selectedCompanyAttribute = JSON.parse(localStorage.getItem('product-selected-company-attribute-value'));

                $j('#webapp-product-compare-listview .webapp-dproduct-name-value').html('');
                $j('#webapp-product-compare-listview .webapp-dproduct-name-property').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-0').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-1').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-2').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-3').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-4').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-value-5').html('');


                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-dproduct-name-0').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-0').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-1').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-2').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-3').html('');
                $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-name-4').html('');

                for (var p = 0; p < selectedProductAttribute.length; p++) {

                    if (p == 0) {

                        $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-dproduct-name-property').append('<div class="webapp-dproduct-name"><div class="webapp-verticle-align-bottom webapp-nested-name-block text-left"><h4 style="font-size:13px !important; color:#000 !important;">Eigenschaften</h4></div></div>');

                    }

                    $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-dproduct-name-property').append('<div class="webapp-nested-attri-block" style=" display:block; position:relative;"><label>' + selectedProductAttribute[p]['attribute_name'] + '</label></div>');

                }

                for (var p = 0; p < selectedProductAttribute.length; p++) {

                    if (p == 0) {
                        $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-dproduct-name-value').append('<div class="webapp-dproduct-name-0"><div class="webapp-verticle-align-bottom webapp-nested-name-block text-left" style="background-color:#fff; display:block; position:relative;"><h4 style="font-size:15px !important;">' + product_name_array + '</h4><h2>CSL Behring</h2></div></div>');
                    }

                    $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-dproduct-name-value').append('<div class="webapp-nested-attri-block" style="background-color:#0b7e79; color:#fff; display:block; position:relative;"><label>' + selectedProductAttribute[p]['value'] + '</label></div>');

                }


                for (var p = 0; p < selectedCompany.length; p++) {

                    $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-value').eq(p).append('<div class="webapp-cproduct-name-' + p + ' webapp-cproduct-names" ><div class="webapp-verticle-align-bottom webapp-nested-name-block text-left" style="background-color:#fff; display:block; position:relative;"><h4 style="font-size:15px !important;">' + company_name[p] + '</h4><h2>' + company_product_name[p] + '</h2></div></div>');

                    for (var j = 0; j < selectedCompanyAttribute.length; j++) {

                        if (selectedCompany[p] == JSON.parse(selectedCompanyAttribute[j]['company_id'])) {

                            $j('#webapp-product-compare-listview .ui-li-has-thumb .webapp-cproduct-value').eq(p).append('<div class="webapp-nested-attri-block" style="background-color:#cccccc; color:#4d4d4f; display:block; position:relative;"><label>' + selectedCompanyAttribute[j]['value'] + '</label></div>');

                        }

                    }

                }


                $j("#webapp-product-compare-listview").listview('refresh');


                $j("#tabs").tabs("option", "active", 3);


                /* MATCH HEIGHT */


                var maxNameHeight = Math.max($j('.webapp-dproduct-name-0 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-0 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-1 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-2 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-3 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-4 .webapp-nested-name-block').height(), $j('.webapp-cproduct-name-5 .webapp-nested-name-block').height());

                $j('.webapp-dproduct-name .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-dproduct-name-0 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-0 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-1 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-2 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-3 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-4 .webapp-nested-name-block').height((maxNameHeight - 1));
                $j('.webapp-cproduct-name-5 .webapp-nested-name-block').height((maxNameHeight - 1));


                for (var h = 0; h < selectedProductAttribute.length; h++) {

                    var propertertyblock = $j('.webapp-dproduct-name-property .webapp-nested-attri-block').eq(h).height() + ',';
                    var dproductblock = $j('.webapp-dproduct-name-value .webapp-nested-attri-block').eq(h).height() + ',';


                    var maxHeight = Math.max($j('.webapp-dproduct-name-property .webapp-nested-attri-block').eq(h).height(), $j('.webapp-dproduct-name-value .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-0 .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-1 .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-2 .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-3 .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-4 .webapp-nested-attri-block').eq(h).height(), $j('.webapp-cproduct-name-value-5 .webapp-nested-attri-block').eq(h).height());

                    $j('.webapp-dproduct-name-property .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-dproduct-name-value .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-0 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-1 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-2 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-3 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-4 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));
                    $j('.webapp-cproduct-name-value-5 .webapp-nested-attri-block').eq(h).height((maxHeight - 1));

                }

            }
            //h update dynamic width
            dynamicWidth();

        },


        /* POTRATE PDF GENERATION */

        generatePDF: function () {

            var columnsarray = [];
            var rowsarray = [];

            $j('.webapp-dproduct-name-property .webapp-dproduct-name').each(function (i) {
                if ($j('.webapp-dproduct-name-property .webapp-dproduct-name').eq(i).text() != "") {
                    columnsarray.push(" ")
                }
            });

            $j('.webapp-dproduct-name-value .webapp-dproduct-name-0').each(function (i) {
                if ($j('.webapp-dproduct-name-value .webapp-dproduct-name-0').eq(i).text() != "") {
                   // columnsarray.push($j('.webapp-dproduct-name-value .webapp-dproduct-name-0').eq(i).text())
                   var txtProd = $j(this).find('.webapp-nested-name-block h4').text();
                   var txtCom = $j(this).find('.webapp-nested-name-block h2').text();
                   columnsarray.push(txtProd + '\n' + txtCom)
               }
           });

            $j('.webapp-cproduct-value').each(function (i) {
                if ($j(this).find('.webapp-cproduct-names .webapp-nested-name-block').text() != "") {
                    //columnsarray.push($j(this).find('.webapp-cproduct-names .webapp-nested-name-block').text())
                    var txtProd = $j(this).find('.webapp-cproduct-names .webapp-nested-name-block h4').text();
                    var txtCom = $j(this).find('.webapp-cproduct-names .webapp-nested-name-block h2').text();
                    columnsarray.push(txtProd + '\n' + txtCom)
                }
            });


            $j('.webapp-dproduct-name-property .webapp-nested-attri-block').each(function (i) {

                var parray = [];
                var carray = [];

                parray.push($j('.webapp-dproduct-name-property .webapp-nested-attri-block').eq(i).text(), $j('.webapp-dproduct-name-value .webapp-nested-attri-block').eq(i).text());
                $j('#sortable .webapp-cproduct-value').each(function (j) {

                    if ($j('#sortable .webapp-cproduct-value').eq(j).find('.webapp-nested-attri-block').eq(i).text() != '') {
                        carray.push($j('#sortable .webapp-cproduct-value').eq(j).find('.webapp-nested-attri-block').eq(i).text());
                    }

                });

                rowsarray.push($j.merge($j.merge([], parray), carray));

            });

            var columns = columnsarray;
            var rows = rowsarray;

            var doc = new jsPDF('p', 'pt');
            doc.autoTable(columns, rows, {
                theme: 'grid',
                tableWidth: 'auto',
                pageBreak: 'auto',
                styles: {
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'top'
                },
                headerStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [93, 159, 157],
                    fontSize: 12,
                    rowHeight: 30
                },
                columnBodyStyles: {
                    email: {
                        fontStyle: 'normal'
                    }
                },
                margin: {top: 0, left: 20, right: 20, bottom: 20},
                createdCell: function (cell, data) {
                    if (data.column.dataKey === 0) {
                        cell.styles.textColor = [77, 77, 79];
                        // cell.styles.fillColor = [255, 255, 255];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    } else if (data.column.dataKey === 1) {
                        cell.styles.textColor = [77, 77, 79];
                        //cell.styles.fillColor = [11, 126, 121];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    } else {
                        cell.styles.textColor = [77, 77, 79];
                        // cell.styles.fillColor = [204, 204, 204];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    }
                }
            });


            if (navigator.connection.type == 'none') {

                var pdfdata = doc.output('dataurlstring');
                window.open(pdfdata, '_blank', 'location=yes');

            } else {

                var pdfdata = doc.output();
                $j.ajax({
                    method: "POST",
                    url: "http://product.compare.2281008-0401.anx-cus.net/pdf/pdf.php",
                    data: {data: pdfdata},
                }).done(function (data) {

                    //cordova.InAppBrowser.open('https://docs.google.com/viewer?url=https://docs.google.com/viewer?url=http://product.compare.2281008-0401.anx-cus.net/pdf/'+data, '_blank','location=yes');
                    window.open('http://product.compare.2281008-0401.anx-cus.net/pdf/' + data, '_system', 'location=yes');

                });

            }

        },

        /* LANDSCAPE PDF GENERATION */

        generateLandPDF: function () {

            var columnsarray = [];
            var rowsarray = [];

            $j('.webapp-dproduct-name-property .webapp-dproduct-name').each(function (i) {
                if ($j('.webapp-dproduct-name-property .webapp-dproduct-name').eq(i).text() != "") {
                    columnsarray.push(" ")
                }
            });

            $j('.webapp-dproduct-name-value .webapp-dproduct-name-0').each(function (i) {
                if ($j('.webapp-dproduct-name-value .webapp-dproduct-name-0').eq(i).text() != "") {
                    //columnsarray.push($j('.webapp-dproduct-name-value .webapp-dproduct-name-0').eq(i).text())
                    var txtProd = $j(this).find('.webapp-nested-name-block h4').text();
                    var txtCom = $j(this).find('.webapp-nested-name-block h2').text();
                    columnsarray.push(txtProd + '\n' + txtCom)
                }
            });

            $j('.webapp-cproduct-value').each(function (i) {
                if ($j(this).find('.webapp-cproduct-names .webapp-nested-name-block').text() != "") {
                   // columnsarray.push($j(this).find('.webapp-cproduct-names .webapp-nested-name-block').text())
                   var txtProd = $j(this).find('.webapp-cproduct-names .webapp-nested-name-block h4').text();
                   var txtCom = $j(this).find('.webapp-cproduct-names .webapp-nested-name-block h2').text();
                   columnsarray.push(txtProd + '\n' + txtCom)
               }
           });


            $j('.webapp-dproduct-name-property .webapp-nested-attri-block').each(function (i) {

                var parray = [];
                var carray = [];

                parray.push($j('.webapp-dproduct-name-property .webapp-nested-attri-block').eq(i).text(), $j('.webapp-dproduct-name-value .webapp-nested-attri-block').eq(i).text());
                $j('#sortable .webapp-cproduct-value').each(function (j) {

                    if ($j('#sortable .webapp-cproduct-value').eq(j).find('.webapp-nested-attri-block').eq(i).text() != '') {
                        carray.push($j('#sortable .webapp-cproduct-value').eq(j).find('.webapp-nested-attri-block').eq(i).text());
                    }

                });

                rowsarray.push($j.merge($j.merge([], parray), carray));

            });

            var columns = columnsarray;
            var rows = rowsarray;

            var doc = new jsPDF('landscape');
            doc.autoTable(columns, rows, {
                theme: 'grid',
                tableWidth: 'auto',
                pageBreak: 'auto',
                styles: {
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'top'
                },
                headerStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [93, 159, 157],
                    fontSize: 12,
                    rowHeight: 30
                },
                columnBodyStyles: {
                    email: {
                        fontStyle: 'normal'
                    }
                },
                margin: {top: 0, left: 20, right: 20, bottom: 20},
                createdCell: function (cell, data) {
                    if (data.column.dataKey === 0) {
                        cell.styles.textColor = [77, 77, 79];
                        // cell.styles.fillColor = [255, 255, 255];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    } else if (data.column.dataKey === 1) {
                        cell.styles.textColor = [77, 77, 79];
                        //cell.styles.fillColor = [11, 126, 121];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    } else {
                        cell.styles.textColor = [77, 77, 79];
                        // cell.styles.fillColor = [204, 204, 204];
                        cell.styles.lineColor = [77, 77, 79];
                        cell.styles.lineWidth = 0
                    }
                }
            });
            if (navigator.connection.type == 'none') {

                var pdfdata = doc.output('dataurlstring');
                window.open(pdfdata, '_blank', 'location=yes');

            } else {

                var pdfdata = doc.output();

                $j.ajax({
                    method: "POST",
                    url: "http://product.compare.2281008-0401.anx-cus.net/pdf/pdf.php",
                    data: {data: pdfdata},
                }).done(function (data) {

                    window.open('http://product.compare.2281008-0401.anx-cus.net/pdf/' + data, '_system', 'location=yes');


                });

            }

        },

        /* FOOTER DATE UPDATE FIELD */

        lastUpdate: function () {

            WEBAPPDB.transaction(
                function (transaction) {
                    transaction.executeSql("SELECT * FROM webapp_update;", [], function (transaction, results) {

                        if (results.rows.length != 0) {
                            for (var r = 0; r < results.rows.length; r++) {
                                var updatedate = new Date(results.rows.item(r).date);
                            }
                            var dataUpdateDate = updatedate.toLocaleString("de");

                            $j('.webapp-last-update-date').html(dataUpdateDate);

                        }
                    });
                });

        },

    };

    //Instantiate Demo

    document.addEventListener("online", dcoachDB.init, false);
    document.addEventListener("offline", dcoachDB.offlineInit, false);

    //();

});

function urlDate(U) {
    var X = !window.XMLHttpRequest ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest;
    X.open('GET', U, false);
    try {
        X.send();
    } catch (y) {
    }
    var dt = X.getResponseHeader("Last-Modified");
    console.log(JSON.stringify(dt));
    return dt ? new Date(dt).toString() : new Date(1970, 0, 0);
}


function dynamicWidth(){

    var minWidth = 3
    var countCompareItem =  jQuery('#sortable li.webapp-cproduct-value .webapp-cproduct-names').length ;
    var outWidth = jQuery('.box-three').width();
    var propertyWidth = jQuery('.webapp-dproduct-name-property').width();
    var nameWidth = jQuery('.webapp-dproduct-name-value').width();

    var maxWidthResize = outWidth - propertyWidth;
    var widthSize = maxWidthResize / (countCompareItem +1);


    var widthNeedRemove = 2 * outWidth / 100;

    if(countCompareItem  == 1){
       // widthNeedRemove = 20;
   }
   widthSize = widthSize - widthNeedRemove;



   jQuery('.webapp-dproduct-name-value').width(widthSize);
   jQuery('.webapp-dproduct-name-0').width(widthSize);
   jQuery('.webapp-cproduct-value').width(widthSize);
   jQuery('#sortable').css('width','auto');

   jQuery('#sortable li.webapp-cproduct-value .webapp-cproduct-names').each(function(){
    jQuery(this).width(widthSize);
    jQuery(this).parent().width(widthSize);
})
}

jQuery(window).bind('orientationchange', function(event) {
  dynamicWidth();
});