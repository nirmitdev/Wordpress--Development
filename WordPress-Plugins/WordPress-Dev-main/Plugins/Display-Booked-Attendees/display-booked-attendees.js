var jq = jQuery.noConflict();
jq(document).ready(function() {
    //only do this if we are on the correct url which is /lives/schedule/
    console.log('ready');
    if (window.location.pathname === "/lives/schedule/") {
        var checkExist = setInterval(function() {
            if (jq('div.am-cabinet-list').length) {
                console.log("the appointments list has loaded up");
                clearInterval(checkExist);
                gatherAndSend();
            }
        }, 100);

        function gatherAndSend() {
            console.log('in the gathering function');
            var dates = jq('#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-content > span > div.am-cabinet-dashboard-appointments > span > div > div.am-cabinet-list > div > div.am-cabinet-list-day-title');
            var userTimeZone = jq('#am-cabinet > div.am-cabinet-dashboard > div.am-cabinet-dashboard-header > div.am-cabinet-timezone > div > div > input').val(); //get the current time zone
            var servs = jq("p.am-col-title:contains('session')"); //get all the services on the page=to appointment times
            var prevDate, currentDate, prevTime, currentTime = "";
            console.log("gathering and sending data...");
            jq('div[id^="el-collapse-content-"] > div > div > div > div').append("<div class='el-row'><ul class='am-data'>Models: </ul></div>");
            var $ulis = jQuery("div[id^='el-collapse-content-'] > div > div > div > div >div > ul"); //get all the new ul's we created so we can append to them one by one
            $ulis.attr('id', function(index) {
                return 'ul' + index;
            });
            var indexUL = 0;
            if (dates.length > 0) { // we actually have appointments so lets go through each one and find the info we need!!!!!!
                var times = jQuery("p:contains('Time')");
                console.log("found this many times: " + times.length);
                if (times.length > 0) {
                    for (i = 0; i < dates.length; i++) {
                        prevDate = jq(dates[i]).text().trim(); //getting just the date trimmed

                        if (prevDate == 'Today') {
                            prevDate = moment().format('MMMM DD YYYY');
                        } else if (prevDate == 'Tomorrow') {
                            prevDate = moment().add(1, 'days').format('MMMM DD YYYY'); //look for tomorrow's date duh
                        }
                        console.log('the prevDate: ' + prevDate);
                        for (j = 0; j < times.length; j++) { //going through the appointment Times one by one
                            console.log("iterating through the following time: " + jq(times[j]).next("h4").text().trim());

                            currentDate = jq(times[j]).closest('div.el-collapse').prev().text().trim(); //this gives us the current time's appointment dates
                            if (currentDate == 'Today') {
                                currentDate = moment().format('MMMM DD YYYY');
                            } else if (currentDate == 'Tomorrow') {
                                currentDate = moment().add(1, 'days').format('MMMM DD YYYY'); //look for tomorrow's date duh
                            }
                            if (prevDate == currentDate) {
                                var localt = jq(times[j]).next("h4").text() //get the next appointment's time for the current dates
                                if (prevTime !== localt) {
                                    prevTime = localt;
                                    if (localt.indexOf('local') >= 0)
                                        localt = localt.substring(0, localt.length - 6);

                                    console.log("iterating through the following time: " + localt);
                                    var fullDate = currentDate + " " + localt;
                                    console.log("the full date before converting to UTC: " + fullDate);
                                    var dt = moment(fullDate, ["MMMM DD YYYY hh:mm a"]).tz('UTC').format('YYYY-MM-DD HH:mm:ss'); //getting the current date and time the way its saved in the DB
                                    console.log('found the following date: ' + fullDate);
                                    console.log('the UTC equivalent: ' + dt);
                                    var nonce = jq(this).attr("data-nonce");
                                    var currentServ = jq(servs[j]).next('h4').text().trim();
                                    console.log("current service:" + currentServ);
                                    jq.ajax({
                                        type: "POST",
                                        async: false,
                                        dataType: "json",
                                        url: myAjax.ajaxurl,
                                        data: {
                                            action: "display-booked-attendees",
                                            appTime: dt,
                                            service: currentServ,
                                            nonce: nonce

                                        },
                                        success: function(response) {
                                            console.log("ajax request was a success!");
                                            displayAttendees(response, indexUL);
                                            indexUL++;
                                        },
                                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                                            console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                                            console.log("text status: " + textStatus);
                                            console.log("errorThrown: " + errorThrown)
                                        }

                                    });


                                }

                            } else {
                                console.log("continuing to the next iteration");
                                continue; //continue to the next time since I just got a bunch of times put together with no specific date reference, have to iterate through all of them each time

                            }

                        }


                    }
                }
            }
        }


        function displayAttendees(data, currentUL) {
            //should have received an array of arrays that looks like this:
            //   data[date][time] = "{"1":{"label":"Instagram:","value":"starig","type":"text"},"2":{"label":"Telegram:","value":"startele","type":"text"}}"
            //
            //
            //
            console.log("made it to displayAttendees function!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(data);
            console.log('the current UL index: ' + currentUL);
            // adding in our custom html stuff to load in the modelsssssssssss

            jq.each(data, function(key, value) {
                let socialMediaTags = value[0];
                // console.log(socialMediaTags);
                socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
                console.log(socialMediaTags);
                socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
                socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
                socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
                socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
                jq('#ul' + currentUL).append('<br /><li class="am-value"> ' + socialTelegram + '       ' + '<a href="https://' + socialIG + '"' + ' target="_blank">' + socialIG + ' </a></li > ');


            });
        }
    }
});