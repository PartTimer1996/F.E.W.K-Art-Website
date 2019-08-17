// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    window.addEventListener('load', function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation')
  
      // Loop over them and prevent submission
      Array.prototype.filter.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
          if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
          }
          form.classList.add('was-validated')
        }, false)
      })
    }, false)
  }())

const stripeToken = Stripe.setPublishableKey(process.env.PUBLISHABLE_KEY);

const $form = $('#checkout-form')

$('.container').hover(function() {
    $( this ).fadeOut( 100 );
    $( this ).fadeIn( 500 );
  });

$form.submit(function(event){
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#cc-number').val(),
        cvc: $('#cc-cvv').val(),
        exp_month: $('#cc-expiration-month').val(),
        exp_year: $('cc-expiration-year').val(),
        name: $('cc-name').val(),
        address_zip: $('#zip').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response){ 
    if (response.error) { 

        $('.payment-errors').text(response.error.message);
        $('.payment-errors').css('display', 'block');
        $form.find('button').prop('disabled', false);
    
    }else{ 

        const token = response.id;

        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    
        $form.get(0).submit;
    }

}


