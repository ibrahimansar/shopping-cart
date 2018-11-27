var stripe = Stripe('pk_test_XBUiwlKpJzF1zpx7tAj0Le5T');

var $form = $('#checkout-form');
$form.submit(function(event){
  console.log('checkedout.js reached');
  $form.find('button').prop('disabled', true);
  stripe.createToken(card).then(function(result) {
    // Handle result.error or result.token
    number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
        //source: req.body.stripeToken
  }, stripeResponseHandler);
  return false; // Dont submit yet
});

function stripeResponseHandler(status, response){
  if(response.error){ // problem!

      // show the errors on form
      $form.find('charge-error').text(response.error.message);
      $form.find('button').prop('disabled', false);
  }else{  // Token was created

    // Get the token ID
    var token = response.id;

    // Make the token value hidden, so that it gets submitted along with others
    $form.append($('<input name="stripeToken"/>').val(token));

    // Submit
    $form.get(0).submit();
  }
};
