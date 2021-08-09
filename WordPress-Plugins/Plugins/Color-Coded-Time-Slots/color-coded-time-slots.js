var jq = jQuery.noConflict();
jq(document).ready(function() {

    var prevService = "";
    var servName = "";

    var datArr = [];
    var month, year, bookingStart = "";
    var checkExist = setInterval(function() {
        if (jq('#am-service-booking').length) {
            console.log("the booking calendar has loaded up");
            clearInterval(checkExist);

            //do something special
            // get info on first load
            // get the month and year

            //get the service name from the h2 element after the form loads of course
            //var observer = new MutationObserver(changeThemColors);
            servName = jq("#am-service-booking > div > div.am-service > div.am-service-header > div.am-service-data > div.am-service-title > h2").text().trim();
            console.log("ready! in what month and year and service? " + jq("div.c-title").text().trim() + " " + servName);

            prevService = servName;
            datArr = jq("div.c-title").text().split(" ");
            month = datArr[16];
            year = datArr[17].substring(0, 4);
            console.log(year);
            console.log(month);
            // turn month name into its corresponding MM format number
            bookingStart = findBookingStart(month, year);
            console.log("the bookingStart month and year: " + bookingStart);
            var day = "";
            var prevDayPicked = "";
            jq("#am-calendar-picker > div > div.c-day-content-wrapper > div").on('mouseup', function(e) {
                var checkTimesExist = setInterval(function() {
                    if (jq('#am-appointment-times0').length) {
                        console.log('the targets name: ' + e.target.nodeName);
                        clearInterval(checkTimesExist);
                        clearTimeSlots();
                        datArr = jq("div.c-title").text().split(" ");
                        console.log("a single day was picked");
                        month = datArr[16];
                        year = datArr[17].substring(0, 4);
                        bookingStart = findBookingStart(month, year);
                        console.log("the bookingStart month and year: " + bookingStart);
                        bookingStart = bookingStart.substring(0, 8);

                        //logic for the first time a day is picked...
                        day = jq(e.target).text().replace(/[^0-9]/g, '');
                        var dateStart = bookingStart.concat(day);

                        var timeRangeInputs = jq("#am-appointment-times0 > div > div > label.el-radio-button.el-radio-button--medium > input"); //going to get the first time slot and the last time slot to query for a date range between these two times udh
                        var timeRangeStart = jq(timeRangeInputs).first().val(); //gets the first time slots
                        console.log('timeRangeStart: ' + timeRangeStart);
                        bookingStart = dateStart + ' ' + timeRangeStart; //should now have a full fledged time zone users date and time like 2021-07-26 00:00, need to convert to utc to pass to the sql query
                        bookingStart = convertLocalToUTC(bookingStart, 'YYYY-MM-DD HH:mm');
                        var timeRangeEnd = jq(timeRangeInputs).last().val();
                        console.log('timeRangeEnd: ' + timeRangeEnd);
                        var bookingEnd = dateStart + ' ' + timeRangeEnd;
                        bookingEnd = convertLocalToUTC(bookingEnd, 'YYYY-MM-DD HH:mm');
                        console.log("the time slot range between: " + bookingStart + ' and ' + bookingEnd);


                        //query the db looking for time slots with appointments and returning this array

                        //figure out how to do the nonce thing for security purposes
                        nonce = jq(this).attr("data-nonce");
                        jq.ajax({
                            type: "POST",
                            dataType: "json",
                            url: myAjax.ajaxurl,
                            data: {
                                action: "color-coded-time-slots",
                                dateStart: bookingStart,
                                dateEnd: bookingEnd,
                                serviceName: servName,
                                nonce: nonce
                            },
                            success: function(response) {
                                console.log("we are in the callback");
                                //console.log(JSON.stringify(response));
                                //here comes the fun! find the time slots with appointments in the DOM and change their background oh yeah!
                                changeBgColors(response);
                                //createPopUp(response.modelTags);

                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                                console.log("text status: " + textStatus);
                                console.log("errorThrown: " + errorThrown)
                            }
                        });
                    }
                }, 100);


            });

            //add an event listener for mouser hovers
            jq(document).off("mouseenter mouseleave").on('mouseenter mouseleave', 'label.myHoverTrigger', function(e) {
                if (e.type == 'mouseenter') {
                    //clearPopUp();
                    e.stopPropagation();
                    //handle the mouseenter event
                    console.log('hovering over the time slot');
                    console.log('the service we are in: ' + servName);
                    datArr = jq("div.c-title").text().split(" ");
                    month = datArr[16];
                    year = datArr[17].substring(0, 4);
                    bookingStart = findBookingStart(month, year);
                    console.log("the bookingStart month and year: " + bookingStart);
                    //console.log("prevDayPicked: " + prevDayPicked);
                    bookingStart = bookingStart.concat(day);
                    var left = e.pageX - 400;
                    var top = e.pageY - 250;
                    if (jq(window).width() < 780) {
                        left = e.pageX - 100;
                        top = e.pageY - 225;
                    }

                    var target = e.target;
                    var bookingTime = target.textContent.trim(); //getting the time slot
                    bookingStart = bookingStart + ' ' + bookingTime; // getting the full fledge date/time for the label being hovered
                    utcDate = convertLocalToUTC(bookingStart, 'YYYY-MM-DD hh:mm a');
                    console.log('the utcDate: ' + utcDate);
                    jq("div#my-pop-up").css("left", left); // the mouse coordinates when hover is actiavted
                    jq("div#my-pop-up").css("top", top);

                    nonce = jq(this).attr("data-nonce");

                    jq.ajax({
                        type: "POST",
                        dataType: "json",
                        url: myAjax.ajaxurl,
                        data: {
                            action: "find_popup_models",
                            bookingFullTime: utcDate,
                            serviceName: servName,
                            nonce: nonce
                        },
                        success: function(response) {
                            console.log("we are in the callback");

                            createPopUp(response); //the target is the label that is being hovered over

                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log("we failed again: " + JSON.stringify(XMLHttpRequest));
                            console.log("text status: " + textStatus);
                            console.log("errorThrown: " + errorThrown)
                        }
                    });


                } else {
                    clearPopUp();
                }

                jq(document).on('touchstart touchend', 'div.btn-close', function(e) {
                    clearPopUp();

                });
            });

            // lets change the colors now
            function changeBgColors(response, target) {
                //access the bookCount with data->bookCount
                //access the models with data->modelTags
                //value key for the colors
                console.log(response);
                var colors = { "1": "#48E2AB", "2": "#F98484", "3": "#7470FF" };
                var bookLength = response.bookCount.length;
                var time_slot, attendees, telegramTag = '';
                var timez = Intl.DateTimeFormat().resolvedOptions().timeZone; //guess at the user's timezone
                for (var i = 0; i < bookLength; i++) {
                    if (response.bookCount[i].booked !== 4) { // weeding out the full booked slots which don't exist on the booking calendar.
                        //$dt = new DateTime($appointmentDateTime, new DateTimeZone($timeZone));
                        console.log("the date we are going through: " + response.bookCount[i].bookingStart);
                        var newStr = response.bookCount[i].bookingStart;
                        //change the date from db to the user's timezone, currently dates are being stored in UTC time zone

                        userTz = convertUTCToLocal(newStr, 'YYYY-MM-DD HH:mm:ss');
                        console.log("bookingStart in user's timezone: " + userTz);
                        time_slot = userTz.substring(11, 16);
                        console.log("the time slot we got: " + time_slot);
                        attendees = response.bookCount[i].booked; //get the number of models booked for the specific time slot we are iterating through
                        console.log("the number of attendees: " + attendees);
                        //telegramTag = extractTelegram(response[i].customFields);
                        //find the time slot and change the bg color, we is almost there
                        console.log("the color being used: " + colors[attendees]);
                        jq(':input[value="' + time_slot + '"]').closest("label").css('background-color', '' + colors[attendees]);
                        jq(':input[value="' + time_slot + '"]').closest("label").addClass("myHoverTrigger");

                        console.log("supposedly changed the background color");
                        // we made it
                    }
                }

            }

            function clearTimeSlots() {
                console.log("clearing the timeslots");
                jq("label.el-radio-button.el-radio-button--medium").css("background", "transparent");
                jq('label.myHoverTrigger').removeClass("myHoverTrigger"); //remove the triggers on previous time slots duh
            }

            function clearPopUp() {
                jq('div#my-pop-up').fadeOut(); // then make disappear the pop up
                jq("ul#my-hover > li").remove(); //remove the list of models first
                jq("ul#my-hover > div.btn-close").remove();
            }

            function findBookingStart(month, year) {
                var months = {
                    "January": "01",
                    "February": "02",
                    "March": "03",
                    "April": "04",
                    "May": "05",
                    "June": "06",
                    "July": "07",
                    "August": "08",
                    "September": "09",
                    "October": "10",
                    "November": "11",
                    "December": "12"
                };
                var mm = months[month];
                var formattedDate = year.concat("-").concat(mm).concat("-");
                // should end up gettin something like "2021-04-"
                return formattedDate;
            }

            function createPopUp(data) {
                console.log('in the createPopUp function');
                if (jq(window).width() < 780) {
                    jq('ul#my-hover').append('<div class="btn-close">&times;</div>');
                }
                jq.each(data, function(key, value) {
                    let socialMediaTags = value[0];
                    console.log('got back the following social tags from db: ', socialMediaTags);
                    // console.log(socialMediaTags);
                    socialMediaTags = socialMediaTags.replace(/\"/g, ''); // get this; "1:label:Instagram:,value:anothertest,type:text,2:label:Telegram:,value:anothertest,type:text"
                    //console.log(socialMediaTags);
                    socialMediaTags = socialMediaTags.split(":"); // get this an array, now need to grab the instagram string which is [4] and the telegram which is [9]
                    socialIG = socialMediaTags[4].substr(0, socialMediaTags[4].indexOf(',')); //will get just the tag by itself
                    socialIG = socialIG.replace(/\\/g, ''); //remove that backslash
                    socialTelegram = socialMediaTags[9].substr(0, socialMediaTags[9].indexOf(',')); //will get just the tag by itself alright!!!!!
                    console.log('the telegram tag we extracted: ' + socialTelegram);
                    jq('ul#my-hover').append('<li>' + socialTelegram + '</li>');
                });


                //jq('div#my-pop-up').css("display", "inline");
                jq('div#my-pop-up').fadeIn();

            }

            function convertLocalToUTC(dt, dtFormat) {
                return moment(dt, dtFormat).utc().format('YYYY-MM-DD HH:mm:ss');
            }

            function convertUTCToLocal(utcDt, utcDtFormat) {
                var toDt = moment.utc(utcDt, utcDtFormat).toDate();
                return moment(toDt).format('YYYY-MM-DD HH:mm:ss');
            }

        }
    }, 100);
});