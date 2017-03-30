var App = {
		serviceURL: '',
		loadedIndividualData: null,
		loadedPartyData: null,
		preparedIndividualData: null,
		loadedCircumscriptionData: null,
		preparedPartyData: null,
        blacklist:['dragnea','thuma','ponta','dolha'],
		selectedProfileUrl: 'http://multumesc.org',
		maxRed: 250,
		maxBlue: 230,
		epsilon: 0.00001,
		penals:0,
		lastUpdateDate: null,
		lastUpdateTimestamp: null,
		crawlTime: null,
		errorCount: null,
		successful: null,	
		
		showCircumscriptions: function() {
			// $('#circumscriptionList').empty();
			$.each(App.loadedCircumscriptionData, function(key, item) {
				var keyCopy = key;
				if (key == "diaspora") {
					return;
				}
				if (key.toLowerCase() == "strainatate") {
					keyCopy = "DIASPORA";
				}
				$('#circumscription').append('<option value="' + key + '">' + App.capitalizeFirstLetter(keyCopy) + '</option>');
			});
		},
		
		showLocalitites: function(chosenCircumscription) {

			var localitySet = [];
			var localityArray = [];
			var localityDropdown = $('#localityDropdown');
			$.each(App.loadedCircumscriptionData[chosenCircumscription],
				function(key, item) {
					$.each(item, function(localitate, biproduct) {
						localitySet[localitate] = true;
						// $('#locality').append('<option value="' + localitate +
						// '">' + localitate + '</option>');
					});
				});

			localityDropdown.empty();
			if (chosenCircumscription.toLowerCase() != 'strainatate') {
				localityDropdown.append('<option value="">Toate localitățile din județ</option>');
			} else {
				localityDropdown.append('<option value="">Toate țările din diaspora</option>');
			}
			for ( var localitate in localitySet) {
				localityArray.push(localitate);
			}
			localityArray.sort();
			for (var i = 0; i < localityArray.length; i++) {
				localitate = localityArray[i];
				localityDropdown.append('<option value="' + localitate + '">' + App.capitalizeFirstLetter(localitate) + '</option>');
			}
			localityDropdown.fadeIn(1);
		},
		
		searchLocality: function(chosenCircumscription, locality) {
			var matchedColegiu = [];
			var anyWithAddress = false;
			var street = $('#street');
			$.each(App.loadedCircumscriptionData[chosenCircumscription], function(colegiu, localities) {
				$.each(localities, function(localitate, addresses) {
					if (localitate == locality) {

						if (addresses.length == 0) {
							matchedColegiu[locality] = colegiu;
						} else {
							anyWithAddress = true;
						}
					}
				});
			});
			if (!anyWithAddress && locality != "") {
				street.fadeOut(1);
			} else {
				street.fadeIn(1);
			}
			App.paintResults(matchedColegiu);
		},
		
		searchAddress: function(chosenCircumscription, locality, street) {
			if (chosenCircumscription == 'bucuresti') {
				locality = "";
			}
			var matchedColegiu = [];
			street = street.toLowerCase();
			$.each(App.loadedCircumscriptionData[chosenCircumscription], function(colegiu,
					localities) {
				$.each(localities,
						function(localitate, addresses) {
							if (localitate == locality || locality == "") {
								if (addresses.length > 0) {
									for ( var addressIndex in addresses) {
										var address = addresses[addressIndex];
										if (address.indexOf(street) > -1) {
											if (chosenCircumscription != 'bucuresti') {
												matchedColegiu[localitate + ' - '
														+ address] = colegiu;

											} else {
												matchedColegiu[address] = colegiu;
											}
											console.debug(address + ' ' + colegiu);
										}
									}
								}
							}
						});
			});
			App.paintResults(matchedColegiu);
		},
		
		paintResults: function(matchedColegiu) {
			var searchResults = $('#searchResults');
			searchResults.empty();
			if (Object.keys(matchedColegiu).length == 0) {
				searchResults.append('Nu am gasit rezultate.');
				return;
			}
			var circumscription = $('#circumscription').val();
			var itemString = '<thead> <tr> <th>Județ / Circumscripție</th> <th>Stradă/Adrese</th> <th>Colegiu</th> <th>Nume deputat</th></tr></thead>';
			searchResults.append(itemString);
			for ( var address in matchedColegiu) {
				var colegiu = matchedColegiu[address];
				itemString = '<tr>';

				itemString += '<td>' + App.capitalizeFirstLetter(circumscription) + '</td>';
				itemString += '<td>' + App.capitalizeFirstLetter(address) + '</td>';
				itemString += '<td>' + colegiu + '</td>';
				var deputyName = App.searchDeputyByCircumscription(circumscription, colegiu);
				var deputyString = '<a href="#" class="deputyDetailsModalLink deputyDetailsLink" deputyname="' + deputyName + '">' + deputyName + '</a>';
				itemString += '<td>' + deputyString + '</td>';
				itemString += '</tr>';
				searchResults.append(itemString);
			}
			
			$('.deputyDetailsModalLink').click(function() {
				$('#search').modal('hide').on('hidden.bs.modal', function() {
					$('html, body').animate({
	                    scrollTop: $('#deputyDetailsTab').offset().top
	                }, 500);
				});
			});
		},
		
		searchDeputyByCircumscription: function(circumscription, colegiu) {
			var localResult = null;
			if (circumscription.toLowerCase() == "strainatate")
				circumscription = 'diaspora';
			$.each(App.loadedIndividualData, function(key, item) {
				if (item.colegiu == colegiu && (circumscription == item.county)) {
					localResult = key;
					return localResult;
				}
			});
			return localResult;
		},
		
		parseParameter: function(val) {
			var result = null, tmp = [];
			location.search
			// .replace ( "?", "" )
			// this is better, there might be a question mark inside
			.substr(1).split("&").forEach(function(item) {
				tmp = item.split("=");
				if (tmp[0] === val)
					result = decodeURIComponent(tmp[1]).replace("+", " ");
			});
			return result;
		},
		
		createProfileData: function(nume) {
			var item = App.loadedIndividualData[nume];
			var smallPictureURL = item.pictureURL.replace("/mari", "");
			$('.big-picture').attr("src", smallPictureURL);

			$('.deputyDetailsTitle').text(item.fullName);
			$('#currentParty').text(item.currentParty);
			$('#partyHistory').text(item.allPartyList);

			// <div id="facebookShareUrlProfile" class="fb-like"
			// data-href="http://multumesc.org/" data-layout="button_count"
			// data-action="recommend" data-show-faces="true" data-share="true"></div>

			// <p>Link direct la statisticile deputatului <label
			// class="deputyDetailsTitle"></label>:<input type="text"
			// id="profileURL"/></p>
			//
			// <div id="facebookShareUrl" class="fb-share-button"
			// data-href="https://developers.facebook.com/docs/plugins/"
			// data-layout="button_count"></div>
			var profileURL = "http://multumesc.org/?deputat=" + encodeURIComponent(item.fullName);
			$('#profileURL').val(profileURL);
			App.selectedProfileUrl = profileURL;
			
			$('.fb-share-button').data("href", profileURL);
			$('.fb-share-button').click(function() {
				FB.ui({
					method : 'share',
					href : App.selectedProfileUrl,
				}, function(response) {
				});
			});

			var hasContactInfo = (item.contactInformation.length > 1) && (item.contactInformation.indexOf("Luări de cuvânt") == -1);
			var $contactInfo = $('#contactInfo');
			if (hasContactInfo) {
				$contactInfo.text(item.contactInformation);
			} else {
				$contactInfo.text("nu sunt disponibile");
			}
			
			var $emailInfo = $('#emailInfo');
			if (item.email) {
				$emailInfo.html('<a href="mailto:' + item.email + '">' + item.email + '</a>');
			} else {
				$emailInfo.text("nu e disponibilă");
			}
			
			$('#county').text(App.capitalizeFirstLetter(item.county));
			
			$('#colegiu').text(item.colegiu);
			
			var $speeches = $('#speeches');
			if (item.speeches) {
				$speeches.text('' + item.speeches);
			} else {
				$speeches.text('0');
			}
			
			var $statements = $('#statements');
			if (item.statements) {
				$statements.text('' + item.statements);
			} else {
				$statements.text('0');
			}
			
			var $inquiries = $('#inquiries');
			if (item.inquiries) {
				$inquiries.text('' + item.inquiries);
			} else {
				$inquiries.text('0');
			}
			
			var $motions = $('#motions');
			if (item.motions) {
				$motions.text('' + item.motions);
			} else {
				$motions.text('0');
			}
			
			var $proposedLaw = $('#proposedLaw');
			if (item.proposedLaw) {
				$proposedLaw.text('' + item.proposedLaw);
			} else {
				$proposedLaw.text('0');
			}
			
			var $passedLaw = $('#passedLaw');
			if (item.passedLaw) {
				$passedLaw.text('' + item.passedLaw);
			} else {
				$passedLaw.text('0');
			}

			var $absence30 = $('#absence30');
			if (item.statsLast30Days.TOTAL.value > 0) {
				var absence30 = Math.round(10.0 * 100.0
						* item.statsLast30Days.ABSENT.value
						/ (item.statsLast30Days.TOTAL.value + App.epsilon)) / 10.0;
				$absence30.text(absence30 + "%").css("color", ' rgb('
																	+ Math.round(absence30 * App.maxRed / 100.0)
																	+ ', 0, '
																	+ Math.round((1.0 - absence30 / 100.0)
																			* App.maxBlue) + ')');
			} else {
				$absence30.text("n/a");
			}
			$('#dnaList').html('');
			var records=item.confirmedRecordList.concat(item.otherRecordList);
			$('#penalty').text(records.length+'');
            var blacklisted= $.inArray(item.lastName.toLowerCase(), App.blacklist );
			if (item.confirmedRecordList.length >0 || (item.otherRecordList.length>0 && blacklisted>-1)) {
				$(".penaltyLabel").fadeIn(2000);
				$.each(records,
					function (keyRecord, record) {
						$('#dnaList').append('<p><a style="color:red;"  target="_blank" href="' + record.link + '">' + record.date + ' ' + record.title + ' </a> </p>');
					}
				);
			}
			else
			{
				$(".penaltyLabel").fadeOut(2);
			}
			var $absence90 = $('#absence90');
			if (item.statsLast90Days.TOTAL.value > 0) {
				var absence90 = Math.round(10.0 * 100.0
						* item.statsLast90Days.ABSENT.value
						/ (item.statsLast90Days.TOTAL.value + App.epsilon)) / 10.0;
				$absence90.text(absence90 + "%").css("color", ' rgb('
																	+ Math.round(absence90 * App.maxRed / 100.0)
																	+ ', 0, '
																	+ Math.round((1.0 - absence90 / 100.0)
																			* App.maxBlue) + ')');
			} else {
				$absence90.text("n/a");
			}
			
			var $absence365 = $('#absence365');
			var $absenceAllTerm = $('#absenceAllTerm');
			
			var absence365 = Math.round(10.0 * 100.0 * item.statsLast365Days.ABSENT.value / (item.statsLast365Days.TOTAL.value + App.epsilon)) / 10.0;
			var absenceAllTerm = Math.round(10.0 * 100.0 * item.statsAllTerm.ABSENT.value / (item.statsAllTerm.TOTAL.value + App.epsilon)) / 10.0;
			
			$absence365.text(absence365 + "%").css("color", ' rgb(' 
																	+ Math.round(absence365 * App.maxRed / 100.0) +
																	', 0, '
																	+ Math.round((1.0 - absence365 / 100.0)
																			* App.maxBlue) + ')');
			
			$absenceAllTerm.text(absenceAllTerm + "%").css("color", ' rgb('
																	+ Math.round(absenceAllTerm * App.maxRed / 100.0) + 
																	', 0, '
																	+ Math.round((1.0 - absenceAllTerm / 100.0)
																			* App.maxBlue) + ')');
			
			$('.profileLink').attr(
					"href",
					"http://www.cdep.ro/pls/parlam/structura2015.mp?idm="
							+ App.loadedIndividualData[nume].personId + "&cam=2&leg=2016");
			$('#deputyDetailsTab').fadeIn(500);
			$('body').delay(10).animate({
				scrollTop : $("#deputyDetailsTab").offset().top
			}, 'slow');
			// alert($("#deputyDetailsTab").offset().top);
		},
		
		plotParties: function(interval) {

			var message = "în ultimele " + interval + " zile";
			if (interval == -1)
				message = "de la începutul legislaturii"
			var labelz = []
			var absenceRate = [];
			var offset = 0;
			var i = 0;
			$.each(App.loadedPartyData[interval],
					function(key, item) {
						if (key.length < 15) {
							labelz.push([ i, key ]);
							absenceRate
									.push([
											i,
											Math
													.round(10.0 * 100.0 * (item.ABSENT.value / item.TOTAL.value)) / 10.0 ]);
		
							i++;
						}
		
					});
			// for (var i = 0; i < 10; i++) {
			// absenceRate.push([i, Math.random()*100.0 ]);
			// labels.push([i, "PSD"]);
			// }

			var options = {
				series : {
					bars : {
						show : true,
						fill : true,
						align : 'center',
						barWidth : 0.3
					}
				},
				xaxis : {
					ticks : labelz
				},
				grid : {
					hoverable : true
				// IMPORTANT! this is needed for tooltip to work
				},
				yaxis : {
					min : 0.0,
					max : 109.0
				},
				tooltip : true,
				tooltipOpts : {
					content : "Absență %y.1 %" + message,
					shifts : {
						x : -60,
						y : 25
					}
				}
			};

			var plotObj = $.plot($("#flot-bar-chart"), [{
				data : absenceRate,
				label : "Rata medie de absență per partid ",
				color : "#AF0101"
			}], options);
		},
		
		plotIndividual: function(nume) {
			var absenceRate = [];
			var offset = 0;
			// for (var i = 0; i < 12; i += 0.2) {
			// presenceRate.push([i, Math.sin(i + offset)]);
			//
			// }
			for (var i = 0; i < App.loadedIndividualData[nume].attendancePerWeekExcludingVacation.length; i++) {
				absenceRate.push([i, 100.0 - App.loadedIndividualData[nume].attendancePerWeekExcludingVacation[i] ]);
			}

			var options = {
				series : {
					lines : {
						show : true,
						fill : true
					},
					points : {
						show : true
					}
				},
				grid : {
					hoverable : true
				// IMPORTANT! this is needed for tooltip to work
				},
				yaxis : {
					min : 0.0,
					max : 109.0
				},
				tooltip : true,
				tooltipOpts : {
					content : "%s <br/> în săptămâna %x.0 de la începutul legislaturii  este de %y.1 %",
					shifts : {
						x : -60,
						y : 25
					}
				}
			};

			var plotObj = $.plot($("#flot-line-chart"), [ {
				data : absenceRate,
				label : "Rata de absență a deputatului " + nume,
				color : "#AF0101"
			} ], options);
		},
		
		capitalizeFirstLetter: function(str) {
			// return str.charAt(0).toUpperCase() + str.slice(1);
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		
		renderTable: function() {
			$('#dataTables-example').DataTable({
				data : App.preparedIndividualData,
				"language" : {
					"decimal" : "",
					"emptyTable" : "Nu există informații corespunzătoare de afișat.",
					"info" : "Se afișează înregistrările de la _START_ la _END_ din _TOTAL_ înregistrări.",
					"infoEmpty" : "Nu există înregistrări care să corespundă căutării.",
					"infoFiltered" : "(selectate dintr-un total de _MAX_ înregistrări)",
					"infoPostFix" : "",
					"thousands" : ",",
					"lengthMenu" : "Afișează _MENU_ dintre înregistrări pe pagină",
					"loadingRecords" : "Se încarcă...",
					"processing" : "Se procesează...",
					"search" : "<span class='emphasis'><b>Filtrează după nume, județ sau partid:</b></span>",
					"zeroRecords" : "Nu s-au găsit înregistrări care să corespundă căutării.",
					"paginate" : {
						"first" : "Prima",
						"last" : "Ultima",
						"next" : "Următoarea",
						"previous" : "Precedenta"
					},
					"aria" : {
						"sortAscending" : ": sortare crescătoare",
						"sortDescending" : ": sortare descrescătoare"
					}
				},
				"lengthMenu" : [ [ 10, 25, 50, -1 ],
						[ 10, 25, 50, "Toate" ] ],
				"autoWidth" : true,
				columns : [ {
					title : "Nume"
				}, {
					title : "Partid"
				}, {
					title : "Județ"
				}, {
					title : "Colegiu"
				},
					{
						title : "Indice de penalitate (număr comunicate DNA)"
					},
                    /*{
					title : "Absențe în ultimele 30 zile"
				}, {
					title : "Absență în ultimele 90 zile"
				}, {
					title : "Absență în ultimele 365 zile"
				},*/ {
					title : "Absență per mandat"
				}, {
					title : "Luări de cuvânt"
				}, {
					title : "Declarații politice"
				}, {
					title : "Întrebări / interpelări"
				}, {
					title : "Moțiuni"
				}, {
					title : "Inițiative legislative"
				}, {
					title : "Inițiative devenite lege"
				}

				],
				stateSave : false,
				iDisplayLength : 10,
				stateDuration : 43200,
				"order" : [ [ 5, "desc" ] ]
			});
		},
		
		showGlobalStats: function(res) {
			globalTotal = [];
			globalAbsence = [];

			globalTotal["30"] = 0;
			globalTotal["90"] = 0;
			globalTotal["365"] = 0;
			globalTotal["all"] = 0;

			globalAbsence["30"] = 0;
			globalAbsence["90"] = 0;
			globalAbsence["365"] = 0;
			globalAbsence["all"] = 0;

			$.each(res, function(key, item) {
				if (item.active) {
					globalAbsence["30"] += item.statsLast30Days.ABSENT.value;
					globalTotal["30"] += item.statsLast30Days.TOTAL.value;

					globalAbsence["90"] += item.statsLast90Days.ABSENT.value;
					globalTotal["90"] += item.statsLast90Days.TOTAL.value;

					globalAbsence["365"] += item.statsLast365Days.ABSENT.value;
					globalTotal["365"] += item.statsLast365Days.TOTAL.value;

					globalAbsence["all"] += item.statsAllTerm.ABSENT.value;
					globalTotal["all"] += item.statsAllTerm.TOTAL.value;

				}
			});
			
			var $global30 = $('#global30');
			var $global90 = $('#global90');
			var $global365 = $('#global365');
			var $globalAll = $('#globalAll');
			
			if (globalTotal["30"] > 0) {
				var absence30 = Math.round(10.0 * 100.0 * globalAbsence["30"]
						/ (globalTotal["30"] + App.epsilon)) / 10.0;
				$global30.text(absence30 + "%").css("color", ' rgb('
																	+ Math.round(absence30 * App.maxRed / 100.0)
																	+ ', 0, '
																	+ Math.round((1.0 - absence30 / 100.0)
																			* App.maxBlue) + ')');
			} else {
				$global30.text("n/a");
			}
			if (globalTotal["90"] > 0) {
				var absence90 = Math.round(10.0 * 100.0 * globalAbsence["90"]
						/ (globalTotal["90"] + App.epsilon)) / 10.0;
				$global90.text(absence90 + "%").css("color", ' rgb('
																	+ Math.round(absence90 * App.maxRed / 100.0)
																	+ ', 0, '
																	+ Math.round((1.0 - absence90 / 100.0)
																			* App.maxBlue) + ')');
			} else {
				$global90.text("n/a");
			}
			var absence365 = Math.round(10.0 * 100.0 * globalAbsence["365"]
					/ (globalTotal["365"] + App.epsilon)) / 10.0;
			$global365.text(absence365 + "%").css("color", ' rgb(' 
																	+ Math.round(absence365 * App.maxRed / 100.0) +
																	', 0, '
																	+ Math.round((1.0 - absence365 / 100.0)
																			* App.maxBlue) + ')');

			var absenceAll = Math.round(10.0 * 100.0 * globalAbsence["all"]
					/ (globalTotal["all"] + App.epsilon)) / 10.0;
			$globalAll.text(absenceAll + "%").css("color", ' rgb(' 
																	+ Math.round(absenceAll * App.maxRed / 100.0) +
																	', 0, '
																	+ Math.round((1.0 - absenceAll / 100.0)
																			* App.maxBlue) + ')');
		},
		
		prepareIndividualData: function(res) {
			App.preparedIndividualData = [];

			$.each(res, function(key, item) {
				// console.info(item.fullName);

				if (item.active) {
					var localCandidate = [];
					var smallPictureURL = item.pictureURL.replace(
							"/mari", "");
					localCandidate
							.push('<a href="#deputyDetailsTab" class="deputyDetailsLink" deputyName="'
									+ item.fullName
									+ '">'
									+ '<img src="'
									+ smallPictureURL
									+ '" width="48" height="64" class="deputyDetailsLink"  deputyName="'
									+ item.fullName
									+ '"/>'
									+ '<span deputyName="' + item.fullName + '">' + item.fullName + '</span>'
									+ '</a>');
					localCandidate.push(item.currentParty);
					localCandidate
							.push(App.capitalizeFirstLetter(item.county));
					if (item.colegiu && item.colegiu != -1)
						localCandidate.push(item.colegiu);
					else
						localCandidate.push("-");
                    var blacklisted= $.inArray(item.lastName.toLowerCase(), App.blacklist );
					if (item.confirmedRecordList.length > 0 || (item.otherRecordList.length>0 && blacklisted>-1))
					{
						var penality=item.confirmedRecordList.length+item.otherRecordList.length;
						localCandidate.push('<a href="#" class="deputyDetailsLink" style="color:red;" deputyName="'
							+ item.fullName
							+ '">'+penality+'</a>');
						App.penals++;
					}
                    else if (item.otherRecordList.length>0)
                    {

                        console.debug("Needs review: "+item.firstName+' '+item.lastName+' '+item.county+' '+item.otherRecordList[0].link);
                        localCandidate.push("0");
                    }
					else
					{
						localCandidate.push("0");
					}
					/*
                    if (item.statsLast30Days.TOTAL.value > 0) {
						var absence30 = Math.round(10.0 * 100.0
								* item.statsLast30Days.ABSENT.value
								/ item.statsLast30Days.TOTAL.value) / 10.0;
						localCandidate.push('<span style="color: rgb('
								+ Math
										.round(absence30 * App.maxRed
												/ 100.0)
								+ ', 0, '
								+ Math.round((1.0 - absence30 / 100.0)
										* App.maxBlue) + ')">' + absence30
								+ '%</span>');
					} else {
						localCandidate.push('<span>n/a</span>');
					}
					if (item.statsLast90Days.TOTAL.value > 0) {
						var absence90 = Math.round(10.0 * 100.0
								* item.statsLast90Days.ABSENT.value
								/ item.statsLast90Days.TOTAL.value) / 10.0;
						localCandidate.push('<span style="color: rgb('
								+ Math
										.round(absence90 * App.maxRed
												/ 100.0)
								+ ', 0, '
								+ Math.round((1.0 - absence90 / 100.0)
										* App.maxBlue) + ')">' + absence90
								+ '%</span>');
					} else {
						localCandidate.push('<span>n/a</span>');
					}
					var absence365 = Math.round(10.0 * 100.0
							* item.statsLast365Days.ABSENT.value
							/ item.statsLast365Days.TOTAL.value) / 10.0;
					localCandidate.push('<span style="color: rgb('
							+ Math.round(absence365 * App.maxRed / 100.0)
							+ ', 0, '
							+ Math.round((1.0 - absence365 / 100.0)
									* App.maxBlue) + ')">' + absence365
							+ '%</span>');
                    */
					var absenceAllTerm = Math.round(10.0 * 100.0
							* item.statsAllTerm.ABSENT.value
							/ item.statsAllTerm.TOTAL.value) / 10.0;
					localCandidate.push('<span style="color: rgb('
							+ Math.round(absenceAllTerm * App.maxRed
									/ 100.0)
							+ ', 0, '
							+ Math.round((1.0 - absenceAllTerm / 100.0)
									* App.maxBlue) + ')">' + absenceAllTerm
							+ '%</span>');

					if (item.speeches)
						localCandidate.push('' + item.speeches);
					else
						localCandidate.push('0');
					if (item.statements)
						localCandidate.push('' + item.statements)
					else
						localCandidate.push('0');

					if (item.inquiries)
						localCandidate.push('' + item.inquiries);
					else
						localCandidate.push('0');

					if (item.motions)
						localCandidate.push('' + item.motions);
					else
						localCandidate.push('0');

					if (item.proposedLaw)
						localCandidate.push('' + item.proposedLaw);
					else
						localCandidate.push('0');
					if (item.passedLaw)
						localCandidate.push('' + item.passedLaw);
					else
						localCandidate.push('0');

					App.preparedIndividualData.push(localCandidate);

				}
			});
			console.log("Penals: " + App.penals);
            $('#penalCount').text(App.penals);
		}

};

$(document).ready(function() {

	var clipboardObject = new Clipboard('.btn');
	$.ajax({
		url : App.serviceURL
				+ 'data/personStatsTogether.json',
		type : 'GET',
		async : true,
		cache : true,
		contentType : "application/json; charset=utf-8",
		dataType : 'json',
		error : function(xhr, ajaxOptions, thrownError) {
			console.error(thrownError);
		},
		success : function(res) {
			App.lastUpdateDate = res.lastUpdateDateTime
					.substr(0, res.lastUpdateDateTime
							.indexOf('T'));
			$('#lastUpdateDateTime').text(
					App.lastUpdateDate);
			lastUpdateDateTime = res.lastUpdateDateTime;
			App.lastUpdateTimestamp = res.lastUpdateTimestamp;
			App.crawlTime = res.crawlTime;
			App.errorCount = res.errorCount;
			App.successful = res.successful;
			App.loadedIndividualData = res.payload;
			console.log("Succesful: " + App.successful);
			console.log("Processing time:" + App.crawlTime);
			console.log("Error count: " + App.errorCount);
			console.log("Last updated:"
					+ lastUpdateDateTime);
			console.log("Last update timestamp:"
					+ App.lastUpdateTimestamp);
			console.log("Number of profiles: "
					+ Object.keys(res.payload).length);
			// alert("Loaded "+res.length);
			App.prepareIndividualData(App.loadedIndividualData);
			App.renderTable();
			App.showGlobalStats(App.loadedIndividualData);
			try {
				var inLinkName = App.parseParameter("deputat");
				if (inLinkName) {
					App.plotIndividual(inLinkName);
					App.createProfileData(inLinkName);
				}
			} catch (err) {
				console.error(err.message);
			}
			$('body').on('click', '.deputyDetailsLink', function(event) {
				var deputyName = event.target.attributes["deputyName"].nodeValue;
				App.plotIndividual(deputyName);
				App.createProfileData(deputyName);

			});
		}
	});

	$.ajax({
		url : App.serviceURL + 'data/partyStats.json',
		type : 'GET',
		async : true,
		cache : true,
		contentType : "application/json; charset=utf-8",
		dataType : 'json',
		error : function(xhr, ajaxOptions, thrownError) {
			console.error(thrownError);
		},
		success : function(res) {
			App.loadedPartyData = res;
			console.log("Parties loaded: "
					+ Object.keys(res[-1]).length);
			App.plotParties(-1);
		}
	});

	$('#button-365').change(function() {
		App.plotParties(365);
	});

	$('#button-30').change(function() {
		App.plotParties(30);
	});
	$('#button-90').change(function() {
		App.plotParties(90);
	});
	$('#button-all').change(function() {
		App.plotParties(-1);
	});

	$('#doSearch').click(function() {
		App.searchAddress($('#circumscription').val(), $('#localityDropdown').val(), $('#street').val());
	});

	$('#searchTrigger').click(function() {
		$.ajax({
			url : App.serviceURL
					+ 'data/circumscription.min.json',
			type : 'GET',
			async : true,
			cache : true,
			contentType : "application/json; charset=utf-8",
			dataType : 'json',
			error : function(xhr,
					ajaxOptions,
					thrownError) {
				console
						.error(thrownError);
			},
			success : function(res) {
				App.loadedCircumscriptionData = res;
				console
						.log("Circumscriptions loaded: "
								+ Object
										.keys(res).length);
				App.showCircumscriptions();
				$('#waitingSearchLoad').delay(100).fadeOut(1000);
				$('#searchInputGroup').delay(500).fadeIn(1000);
				$('#search').modal();
			}
		});
	});

	$('#circumscription').change(function() {
		console.debug($('#circumscription').val());
		if ($('#circumscription').val() != 'bucuresti') {
			App.showLocalitites($('#circumscription').val());
			if ($('#circumscription').val() != 'STRAINATATE') {
				$('#street').fadeIn(1);
			} else {
				$('#street').fadeOut(1);
			}

		} else {
			$('#localityDropdown').fadeOut(1);
			//$('#doSearch').fadeIn(1);
			$('#street').fadeIn(1);
		}
		$('#searchResults').empty();
	});
	
	$('#street').keyup(function() {
		if ($('#street').val().length > 2) {
			App.searchAddress($('#circumscription').val(),
					$('#localityDropdown').val(), $(
							'#street').val());
		}
	});

	$('#street').keypress(function(e) {
		if (e.which == 13) {
			App.searchAddress($('#circumscription').val(),
					$('#localityDropdown').val(), $(
							'#street').val());

		}
	});
	
	$('#localityDropdown').change(
		function() {
			console.debug($('#circumscription').val());
			App.searchLocality($('#circumscription').val(), $(
					'#localityDropdown').val());
		});
});
