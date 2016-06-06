var App = {
		serviceURL: '',
		selectedProfileUrl: 'http://multumesc.org',
		lastUpdateDate: null,
		lastUpdateTimestamp: null,
		crawlTime: null,
		errorCount: null,
		successful: null,	
		


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
					},{
					title : "Absențe în ultimele 30 zile"
				}, {
					title : "Absență în ultimele 90 zile"
				}, {
					title : "Absență în ultimele 365 zile"
				}, {
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
				"order" : [ [ 4, "desc" ] ]
			});
		},
		

		
		prepareIndividualData: function(res) {
            $.each(res, function(keyDeputy, itemDeputy) {
                console.log(itemDeputy.nume);
                if (itemDeputy.date && itemDeputy.date.actionar)
                {
                    $.each(itemDeputy.date.actionar, function(keyCompany, itemCompany) {
                        console.log(itemCompany.denumire);
                        lastYear=1990;
                        lastBalance=null;
                        $.each(itemCompany.bilanturi, function(keyBalance, itemBalance) {
                            if (itemBalance.an>lastYear)
                            {
                                lastYear=itemBalance.an;
                                lastYear=itemBalance;
                            }
                        });

                    });
                }
            });
        }
}

$(document).ready(function() {

	$.ajax({
		url : App.serviceURL
				+ 'data/firme-deputati.json',
		type : 'GET',
		async : true,
		cache : true,
		contentType : "application/json; charset=utf-8",
		dataType : 'json',
		error : function(xhr, ajaxOptions, thrownError) {
			console.error(thrownError);
		},
		success : function(res) {
            App.loadedIndividualData=res;
			App.prepareIndividualData(App.loadedIndividualData);
			App.renderTable();

		}
	});


	$('#button-365').change(function() {
		App.plotParties(365);
	});


	$('#doSearch').click(function() {
		App.searchAddress($('#circumscription').val(), $('#localityDropdown').val(), $('#street').val());
	});


});
