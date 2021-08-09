<?php

/**
 * Plugin Name: Display Booked Attendees - Amelia
 * Plugin URI: https://github.com/gercamjr/WordPress-Dev
 * Description: This plugin will display customers who have booked an appointment at a given time.
 * Version: 1.1.0
 * Author: Gerardo Camorlinga Jr
 * Author URI: http://github.com/gercamjr
 * License: GPL2
 */
// Fires after WordPress has finished loading, but before any headers are sent.
//Add admin page to the menu


//add_action('admin_menu', 'add_admin_page');

add_action('init', 'script_enqueuer');
add_action('wp_ajax_display-booked-attendees', 'display_booked_attendees');
add_action('wp_ajax_nopriv_display-booked-attendees', 'display_booked_attendees');

/** @return never  */
function display_booked_attendees()
{
    global $wpdb;
    error_log("made it to the ajax request");
    if (isset($_POST)) {
        $appTime = $_POST['appTime'];
        $service = $_POST['service'];
        error_log("going to search for the following appointment: ");
        error_log('date and time: ' . $appTime);
        error_log('service: ' . $service);

        $servicesInDB = "Select name, id from wp_amelia_services;";
        $servResult = $wpdb->get_results($servicesInDB);

        foreach($servResult as $key => $row) {
            // each column in your row will be accessible like this
            $services[$row->name] = $row->id;
        }
        $serviceID = $services[$service];

        $sql = $wpdb->prepare("select apps.bookingStart, books.status, apps.serviceId, books.customFields as SocialTags from wp_amelia_customer_bookings as books inner join wp_amelia_appointments as apps on books.appointmentId = apps.id inner join wp_amelia_users as cust on books.customerId = cust.id inner join wp_amelia_services as serv on apps.serviceId = serv.id where apps.bookingStart = %s  and apps.serviceId = %d and (books.status = 'approved' or books.status='pending')  order by bookingStart;", $appTime, $serviceID);
        $result = $wpdb->get_results($sql);
        //populate with the social media tags if results are not empty

        if (count($result) > 0) {

            foreach ($result as $social) {
                error_log("the social tag being added to array: " . $social->SocialTags);
                $socialResults[] = array(
                    $social->SocialTags
                );
            }
        }
        //error_log("empty strings dang it");
        echo json_encode($socialResults);
        error_log("echoed the json encoded query results...");
    }
    die();
}

/** @return void  */
function script_enqueuer()
{

    // Register the JS file with a unique handle, file location, and an array of dependencies
    wp_register_script("display-booked-attendees", plugin_dir_url(__FILE__) . 'display-booked-attendees.js', array('jquery'));



    // localize the script to your domain name, so that you can reference the url to admin-ajax.php file easily
    wp_localize_script('display-booked-attendees', 'myAjax', array('ajaxurl' => admin_url('admin-ajax.php')));

    // enqueue jQuery library and the script you registered above

    wp_enqueue_script('jquery');
    wp_enqueue_script('display-booked-attendees');
}
?>