#language: en

Feature: Event Delivery Verification on Connections Dashboard
  As a user, I want to verify that events are delivered correctly
  So that I can be confident in the data flow

#   @ui_api
  Scenario: Delivered event count should increase after sending an 'identify' event following specific UI flow
    Given a user is logged in and on the Connections dashboard
    When the user retrieves data plane URL from the dashboard
    And navigates to the HTTP test source page
    And retrieves write key from the source page
    And initializes the API client
    And navigates to the Webhook Events tab
    And sends an 'identify' event via the API
    And refreshes the event list
    Then the delivered event count should increase by 1
    # And the "-" event should appear in the events list

#   @ui_api
  Scenario: A custom 'track' event with specific properties should be visible in the events list
    Given a user is logged in and on the Connections dashboard
    When the user retrieves data plane URL from the dashboard
    And navigates to the HTTP test source page
    And retrieves write key from the source page
    And initializes the API client
    And navigates to the Webhook Events tab
    And sends a 'track' event with event name "Product Purchased new" and properties
      | property_name | property_value     |
      | name          | Shirt              |
      | revenue       | 4.99               |
    And refreshes the event list
    Then the delivered event count should increase by 1
    And the "Product Purchased new" event should appear in the events list

#   @ui_api
  Scenario: A custom 'page' event with specific properties should be visible in the events list
    Given a user is logged in and on the Connections dashboard
    When the user retrieves data plane URL from the dashboard
    And navigates to the HTTP test source page
    And retrieves write key from the source page
    And initializes the API client
    And navigates to the Webhook Events tab
    And sends a 'page' event with page name "Page View" and properties
      | property_name | property_value |
      | title         | Home           |
      | path          | /              |
    And refreshes the event list
    Then the delivered event count should increase by 1
    # And the "Page View" event should appear in the events list