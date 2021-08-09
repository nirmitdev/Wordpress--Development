<?php

/**
 * Plugin Name: Display Master Schedule
 * Plugin URI: https://github.com/gercamjr/WordPress-Dev
 * Description: This plugin will display the schedules for the services provided through Amelia Booking Plugin.
 * Version: 1.0.0
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://github.com/gercamjr
 * License: GPL2
 */

function formatNYCTime($theTime)
{
    $dtN = new DateTime($theTime, new DateTimeZone("UTC"));
    $dtN->setTimezone(new DateTimeZone('America/New_York'));
    return $dtN->format("M d,Y h:i a");
}

function extractSocialTags($theTag)
{ //{"1":{"label":"Instagram:","value":"@lilshawtygem","type":"text"},"2":{"label":"Telegram:","value":"@shawtysupreme","type":"text"}}
    error_log("the tagstring we are working with: " . $theTag);
    $theLabel = explode('value":"', $theTag);
    $igTag = strtok($theLabel[1], '"');
    $igTag = str_replace('\\', '', $igTag);


    $telegramTag = str_replace('"', "", $theLabel[2]); //
    $telegramTag = substr($telegramTag, 0, -12);
    $theTag = $telegramTag . ' ' . $igTag;
    error_log("the tag we extraced: " . $theTag);
    return $theTag;
}


function showModelPage()
{
    wp_enqueue_script('jquery');
    wp_register_style('showAdminPage', plugins_url('Display-Master-Schedule/pluginpage.css'));
    wp_register_script('showAdminPage', plugins_url('Display-Master-Schedule/pluginpage.js'));
    wp_register_style("tab-styles", plugin_dir_url(__FILE__) . 'tab-styles.css');
    wp_register_script('tab-function', plugin_dir_url(__FILE__) . 'tab-function.js');
    global $wpdb;
    $default_tab = '10k';
    $beginDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime('+3 days'));
?>
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, '100k')" id="defaultOpen">100k+ IG Live</button>
        <button class="tablinks" onclick="openTab(event, '10k')">10k+ IG Live</button>
        <button class="tablinks" onclick="openTab(event, 'nomin')">No Min IG Live</button>
    </div>
    <script>
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").onload = function() {
            myFunction()
        };

        function myFunction() {
            document.getElementById("defaultOpen").click();
        }
    </script>
    <?php

    echo ('<!-- Tab content -->


    
<div id="10k" class="tabcontent">');
    echo "<h1>10k+ IG Live Amelia Appointments</h1>";

    $arr = $wpdb->get_results("select apps.bookingStart as AppointmentTime, serv.Name as Service, books.customFields as SocialMediaTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart between '" . $beginDate . "' and '" . $endDate . "' and books.status = 'approved' and apps.serviceId = 3 order by bookingStart;");
    //$arr = $wpdb->get_results($sql);

    echo '<div id="dt_example"><div id="container"><form><div id="demo">';
    echo '<table cellpadding="0" cellspacing="0" border="0" class="display" id="customAdminView"><thead><tr>';

    echo "<td>Date</td>";
    echo "<td>Time</td>";

    echo "<td>Model</td>";

    echo '</tr></thead><tbody>';
    $currentDate = '';
    $currentTime = '';
    $prevDate = '';
    $prevTime = '';

    foreach ($arr as $i => $j) {
        //echo "<tr>";
        foreach ($arr[$i] as $k => $v) {
            if ($k == "AppointmentTime") {
                //error_log("the v to format for nyctime: " . $v);
                $v = formatNYCTime($v); //Jul 22,2021 12:00 am
                $currentDate = substr($v, 0, 11);
                $currentTime = substr($v, 12);
                if ($prevDate !== $currentDate) {
                    echo '<tr><td></td><td></td><td></td></tr>';
                    echo '<tr>';
                    echo '<td>' . $currentDate . '</td>';
                    $prevDate = $currentDate;
                } else {
                    echo '<tr>';
                    echo '<td></td>';
                }
                if ($prevTime !== $currentTime) {
                    echo '<td>' . $currentTime . ' NYC time</td>';
                    $prevTime = $currentTime;
                } else {
                    echo '<td></td>';
                }
                error_log("the v formatted: " . $v);
            } else if ($k == "SocialMediaTags") {
                error_log("extracting the social media tags...");
                $v = extractSocialTags($v);
                echo "<td>" . $v . "</td>";
            }
            //echo "<td>" . $v . "</td>";
        }
        echo "</tr>";
    }

    echo '</tbody></table>';
    echo '</div></form></div></div></div>';



    echo ('<div id="nomin" class="tabcontent">');





    echo "<h1>No Minimum IG Live Amelia Appointments</h1>";

    $arr = $wpdb->get_results("select apps.bookingStart as AppointmentTime, serv.Name as Service, books.customFields as SocialMediaTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart between '" . $beginDate . "' and '" . $endDate . "' and books.status = 'approved' and apps.serviceId = 2 order by bookingStart;");
    //$arr = $wpdb->get_results($sql);

    echo '<div id="dt_example"><div id="container"><form><div id="demo">';
    echo '<table cellpadding="0" cellspacing="0" border="0" class="display" id="customAdminView"><thead><tr>';

    //display the column names

    echo "<td>Date</td>";
    echo "<td>Time</td>";

    echo "<td>Model</td>";


    echo '</tr></thead><tbody>';
    $currentDate = '';
    $currentTime = '';
    $prevDate = '';
    $prevTime = '';

    foreach ($arr as $i => $j) {
        //echo "<tr>";
        foreach ($arr[$i] as $k => $v) {
            if ($k == "AppointmentTime") {
                //error_log("the v to format for nyctime: " . $v);
                $v = formatNYCTime($v); //Jul 22,2021 12:00 am
                $currentDate = substr($v, 0, 11);
                $currentTime = substr($v, 12);
                if ($prevDate !== $currentDate) {
                    echo '<tr><td></td><td></td><td></td></tr>';
                    echo '<tr>';
                    echo '<td>' . $currentDate . '</td>';
                    $prevDate = $currentDate;
                } else {
                    echo '<tr>';
                    echo '<td></td>';
                }
                if ($prevTime !== $currentTime) {
                    echo '<td>' . $currentTime . ' NYC time</td>';
                    $prevTime = $currentTime;
                } else {
                    echo '<td></td>';
                }
                error_log("the v formatted: " . $v);
            } else if ($k == "SocialMediaTags") {
                error_log("extracting the social media tags...");
                $v = extractSocialTags($v);
                echo "<td>" . $v . "</td>";
            }
        }
        echo "</tr>";
    }


    echo '</tbody></table>';
    echo '</div></form></div></div></div>';

    echo ('<div id="100k" class="tabcontent">');

    echo "<h1>100K+ IG Live Amelia Appointments</h1>";

    $arr = $wpdb->get_results("select apps.bookingStart as AppointmentTime, serv.Name as Service, books.customFields as SocialMediaTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart between '" . $beginDate . "' and '" . $endDate . "' and books.status = 'approved' and apps.serviceId = 8 order by bookingStart;");
    //$arr = $wpdb->get_results($sql);

    echo '<div id="dt_example"><div id="container"><form><div id="demo">';
    echo '<table cellpadding="0" cellspacing="0" border="0" class="display" id="customAdminView"><thead><tr>';

    //display the column names

    echo "<td>Date</td>";
    echo "<td>Time</td>";

    echo "<td>Model</td>";


    echo '</tr></thead><tbody>';
    $currentDate = '';
    $currentTime = '';
    $prevDate = '';
    $prevTime = '';

    foreach ($arr as $i => $j) {
        //echo "<tr>";
        foreach ($arr[$i] as $k => $v) {
            if ($k == "AppointmentTime") {
                //error_log("the v to format for nyctime: " . $v);
                $v = formatNYCTime($v); //Jul 22,2021 12:00 am
                $currentDate = substr($v, 0, 11);
                $currentTime = substr($v, 12);
                if ($prevDate !== $currentDate) {
                    echo '<tr><td></td><td></td><td></td></tr>';
                    echo '<tr>';
                    echo '<td>' . $currentDate . '</td>';
                    $prevDate = $currentDate;
                } else {
                    echo '<tr>';
                    echo '<td></td>';
                }
                if ($prevTime !== $currentTime) {
                    echo '<td>' . $currentTime . ' NYC time</td>';
                    $prevTime = $currentTime;
                } else {
                    echo '<td></td>';
                }
                error_log("the v formatted: " . $v);
            } else if ($k == "SocialMediaTags") {
                error_log("extracting the social media tags...");
                $v = extractSocialTags($v);
                echo "<td>" . $v . "</td>";
            }
        }
        echo "</tr>";
    }


    echo '</tbody></table>';
    echo '</div></form></div></div></div>';



    ?>
    <script>
        document.addEventListener('DOMContentLoaded', function(event) {
            document.getElementById("defaultOpen").click();
            //the event occurred
        })

        function openTab(evt, cityName) {
            // Declare all variables
            var i, tabcontent, tablinks;

            // Get all elements with class="tabcontent" and hide them
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            // Get all elements with class="tablinks" and remove the class "active"
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }

            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(cityName).style.display = "block";
            evt.currentTarget.className += " active";
        }
    </script>
<?php
}

add_shortcode('custom_model_page', 'showModelPage');

?>