
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
                columns: [
                    {
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
                        title: "CUI",
                        type:"html-num-fmt"
                    }
                    //,{
                    //    title: "Nr. Registrul Comertului"
                    //}
                    , {
                        title: "Stare societate"
                    },
                    {
                        title: "Număr mențiuni Buletinul Procedurilor de Insolvență",
                        type:"html-num-fmt"
                    },
                    {
                        title: "Număr dosare juridice",
                        type:"html-num-fmt"
                    },
                    {
                        title: "Anul ultimului bilanț financiar disponibil"
                    }
                    , {
                        title: "Număr angajați"
                        ,
                        type:"html-num-fmt"
                    }, {
                        title: "Datorii",
                        type:"html-num-fmt"
                    }, {
                        title: "Capital total",
                        type:"html-num-fmt"
                    }, {
                        title: "Venituri totale",
                        type:"html-num-fmt"
                    }, {
                        title: "Cheltuieli totale",
                        type:"html-num-fmt"
                    }, {
                        title: "Profit net",
                        type:"html-num-fmt"
                    },
                    {
                        title: "Pierdere",
                        type:"html-num-fmt"
                    }

                ],
                stateSave: false,
                iDisplayLength: 10,
                stateDuration: 43200,
                "order": [[15, "desc"]]
            });
        },


        formatNumber:function(num)
        {
            var x = Number(num);
            if (!isNaN(x)) {

                return x.toLocaleString();
            }
            else
            {
                return null;
            }
        },

		prepareIndividualData: function(res) {
            App.preparedIndividualData=[];
            var emptyLabel=null;
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
                        var lastYear=1990;
                        var lastBalance=null;
                        $.each(itemCompany.bilanturi, function(keyBalance, itemBalance) {
                            if (itemBalance.an>lastYear)
                            {
                                lastYear=itemBalance.an;
                                lastBalance=itemBalance;
                            }
                        });
                        var localCandidate = [];

                        localCandidate.push(deputyName);
                        localCandidate.push(deputyParty);
                        localCandidate.push(deputyCounty);
                        //TODO: Deschide un modal/overlay care contine un inframe la care voi face rost de link ulterior
                        //TODO: Modalul poate contine un alt link target=_blank catre pagina termene.ro
                        localCandidate.push('<a href="#">'+itemCompany.denumire+"</a>");
                        if (lastBalance!=null)
                        localCandidate.push(lastBalance.tip_activitate);
                        else
                            localCandidate.push(emptyLabel);

                        localCandidate.push(itemCompany.cui);
                        //localCandidate.push(itemCompany.nr_reg_com);
                        localCandidate.push(itemCompany.stare_societate);
                        localCandidate.push(itemCompany.nr_mentiuni_BPI);
                        localCandidate.push(itemCompany.nr_dosare_juridice);
                        if (lastBalance!=null)
                        {
                            localCandidate.push(lastBalance.an);
                            localCandidate.push(lastBalance.numar_mediu_angajati);
                            localCandidate.push(App.formatNumber(lastBalance.datorii));
                            localCandidate.push(App.formatNumber(lastBalance.capital_total));
                            localCandidate.push(App.formatNumber(lastBalance.venituri_total));
                            localCandidate.push(App.formatNumber(lastBalance.cheltuieli_totale));
                            if (lastBalance.profit_net != '-')
                            {
                                localCandidate.push(App.formatNumber(lastBalance.profit_net));
                            }
                            else
                            {
                                localCandidate.push(emptyLabel);
                            }

                            if (lastBalance.pierdere_net != '-')
                            {
                                localCandidate.push('<span style="color: red;">'+(App.formatNumber("-"+lastBalance.pierdere_net))+'</span>');
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
