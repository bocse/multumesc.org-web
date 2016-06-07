var App = {
		serviceURL: '',
		selectedProfileUrl: 'http://multumesc.org',
		lastUpdateDate: null,
		lastUpdateTimestamp: null,
        preparedIndividualData: [],
		crawlTime: null,
		errorCount: null,
		successful: null,	
		


		renderTable: function() {
            $('#dataTables-example').DataTable({
                data: App.preparedIndividualData,
                "language": {
                    "decimal": "",
                    "emptyTable": "Nu există informații corespunzătoare de afișat.",
                    "info": "Se afișează înregistrările de la _START_ la _END_ din _TOTAL_ înregistrări.",
                    "infoEmpty": "Nu există înregistrări care să corespundă căutării.",
                    "infoFiltered": "(selectate dintr-un total de _MAX_ înregistrări)",
                    "infoPostFix": "",
                    "thousands": ",",
                    "lengthMenu": "Afișează _MENU_ dintre înregistrări pe pagină",
                    "loadingRecords": "Se încarcă...",
                    "processing": "Se procesează...",
                    "search": "<span class='emphasis'><b>Filtrează după nume, județ sau partid:</b></span>",
                    "zeroRecords": "Nu s-au găsit înregistrări care să corespundă căutării.",
                    "paginate": {
                        "first": "Prima",
                        "last": "Ultima",
                        "next": "Următoarea",
                        "previous": "Precedenta"
                    },
                    "aria": {
                        "sortAscending": ": sortare crescătoare",
                        "sortDescending": ": sortare descrescătoare"
                    }
                },
                "lengthMenu": [[10, 25, 50, -1],
                    [10, 25, 50, "Toate"]],
                "autoWidth": true,
                columns: [{
                    title: "Nume"
                }, {
                    title: "Partid"
                }, {
                    title: "Județ"
                },
                    {
                        title: "Nume firmă"
                    }, {
                        title: "Tip de activitate"
                    }, {
                        title: "CUI"
                    }, {
                        title: "Nr. Registrul Comertului"
                    }, {
                        title: "Stare societate"
                    },
                    {
                        title: "Număr mențiuni Buletinul Procedurilor de Insolvență"
                    },
                    {
                        title: "Număr dosare juridice"
                    },
                    {
                        title: "Anul ultimului bilanț financiar disponibil"
                    }
                    , {
                        title: "Număr angajați"
                    },{
                        title: "Datorii"
                    }, {
                        title: "Capital total"
                    }, {
                        title: "Venituri totale"
                    }, {
                        title: "Cheltuieli totale"
                    }, {
                        title: "Profit/pierdere net"
                    }

                ],
                stateSave: false,
                iDisplayLength: 10,
                stateDuration: 43200,
                "order": [[4, "desc"]]
            });
        },
		

		
		prepareIndividualData: function(res) {
            App.preparedIndividualData=[];
            var emptyLabel="n/a";
            $.each(res, function(keyDeputy, itemDeputy) {
                console.log(itemDeputy.nume);
                var hasCompany=false;
                var deputyName=itemDeputy.nume;
                var deputyParty='';
                var deputyCounty='';
                if (itemDeputy.date && itemDeputy.date.actionar)
                {
                    hasCompany=true;
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
                        var localCandidate = [];

                        localCandidate.push(deputyName);
                        localCandidate.push(deputyParty);
                        localCandidate.push(deputyCounty);
                        localCandidate.push(itemCompany.denumire);
                        if (lastBalance)
                        localCandidate.push(lastBalance.tip_activitate);
                        else
                            localCandidate.push(emptyLabel);

                        localCandidate.push(itemCompany.cui);
                        localCandidate.push(itemCompany.nr_reg_com);
                        localCandidate.push(itemCompany.stare_societate);
                        localCandidate.push(itemCompany.nr_mentiuni_BPI);
                        localCandidate.push(itemCompany.nr_dosare_juridice);
                        if (lastBalance)
                        {
                            localCandidate.push(lastBalance.an);
                            localCandidate.push(lastBalance.numar_mediu_angajati);
                            localCandidate.push(lastBalance.datorii);
                            localCandidate.push(lastBalance.capital_total);
                            localCandidate.push(lastBalance.venituri_total);
                            localCandidate.push(lastBalance.cheltuieli_totale);
                            if (lastBalance.profit_net != '-')
                            {
                                localCandidate.push(lastBalance.profit_net);
                            }
                            else if (lastBalance.pierdere_net != '-')
                            {
                                localCandidate.push(lastBalance.pierdere_net);
                            }
                            else
                            {
                                localCandidate.push(emptyLabel);
                            }


                        }
                        else
                        {
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);
                            localCandidate.push(emptyLabel);

                        }

                        App.preparedIndividualData.push(localCandidate);
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

			App.prepareIndividualData(res);
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
