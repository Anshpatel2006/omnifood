/*
  Main JS for VegDelight
  - Uses jQuery (see vendors/js/jquery.min.js or CDN)
  - Smooth scrolling
  - Mobile nav toggle
  - Order form modal
  - Form validation
  - Order summary
*/

$(document).ready(function() {
  // Smooth scrolling for nav links
  $('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if (target.length) {
      event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top - 70
      }, 1000);
    }
  });

  // Mobile nav toggle
  $('.js--nav-icon').click(function() {
    var nav = $('.js--main-nav');
    var icon = $('.js--nav-icon i');
    
    nav.slideToggle(200);
    
    if (icon.hasClass('ion-navicon-round')) {
      icon.addClass('ion-close-round');
      icon.removeClass('ion-navicon-round');
    } else {
      icon.addClass('ion-navicon-round');
      icon.removeClass('ion-close-round');
    }
  });

  // ===== ORDER BUTTON FUNCTIONALITY =====
  
  $('.order-btn').click(function(e) {
    e.preventDefault();
    
    var dish = $(this).data('dish');
    var price = $(this).data('price');
    
    // Find the corresponding quantity input and set it to 1
    $('.qty-input[data-dish="' + dish + '"]').val(1);
    
    // Update order summary
    updateOrderSummary();
    
    // Scroll to order form section
    $('html, body').animate({
      scrollTop: $('#order-form-section').offset().top - 70
    }, 1000);
  });

  // ===== QUANTITY CONTROLS =====
  $('.qty-btn.plus').click(function() {
    var input = $(this).siblings('.qty-input');
    var currentVal = parseInt(input.val()) || 0;
    if (currentVal < 10) {
      input.val(currentVal + 1);
      updateOrderSummary();
    }
    updateButtonStates();
  });

  $('.qty-btn.minus').click(function() {
    var input = $(this).siblings('.qty-input');
    var currentVal = parseInt(input.val()) || 0;
    if (currentVal > 0) {
      input.val(currentVal - 1);
      updateOrderSummary();
    }
    updateButtonStates();
  });

  $('.qty-input').on('input', function() {
    var val = parseInt($(this).val()) || 0;
    if (val < 0) $(this).val(0);
    if (val > 10) $(this).val(10);
    updateOrderSummary();
    updateButtonStates();
  });

  function updateButtonStates() {
    $('.qty-input').each(function() {
      var val = parseInt($(this).val()) || 0;
      var minusBtn = $(this).siblings('.qty-btn.minus');
      var plusBtn = $(this).siblings('.qty-btn.plus');
      
      minusBtn.prop('disabled', val <= 0);
      plusBtn.prop('disabled', val >= 10);
    });
  }

  // ===== FORM VALIDATION =====
  
  function validateForm() {
    var isValid = true;
    
    // Clear previous errors
    $('.error-message').text('');
    $('.form-group input, .form-group select, .form-group textarea').removeClass('error');
    
    // Validate name
    var name = $('#customer-name').val().trim();
    if (name.length < 2) {
      $('#name-error').text('Name must be at least 2 characters long');
      $('#customer-name').addClass('error');
      isValid = false;
    }
    
    // Validate email
    var email = $('#customer-email').val().trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#email-error').text('Please enter a valid email address');
      $('#customer-email').addClass('error');
      isValid = false;
    }
    
    // Validate phone
    var phone = $('#customer-phone').val().trim();
    var phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      $('#phone-error').text('Please enter a valid 10-digit phone number');
      $('#customer-phone').addClass('error');
      isValid = false;
    }
    
    // Validate address
    var address = $('#delivery-address').val().trim();
    if (address.length < 10) {
      $('#address-error').text('Please enter a complete delivery address');
      $('#delivery-address').addClass('error');
      isValid = false;
    }
    
    // Validate dishes selection
    var totalItems = 0;
    $('.qty-input').each(function() {
      totalItems += parseInt($(this).val()) || 0;
    });
    
    if (totalItems === 0) {
      $('#dishes-error').text('Please select at least one dish');
      isValid = false;
    }
    
    // Validate delivery time
    var deliveryTime = $('#delivery-time').val();
    if (!deliveryTime) {
      $('#time-error').text('Please select a delivery time');
      $('#delivery-time').addClass('error');
      isValid = false;
    }
    
    return isValid;
  }

  // ===== UPDATE ORDER SUMMARY =====
  
  function updateOrderSummary() {
    var selectedDishes = [];
    var subtotal = 0;
    var deliveryFee = 50;
    
    $('.qty-input').each(function() {
      var quantity = parseInt($(this).val()) || 0;
      if (quantity > 0) {
        var dishName = $(this).data('name');
        var price = parseInt($(this).data('price'));
        var itemTotal = price * quantity;
        
        selectedDishes.push({
          name: dishName,
          quantity: quantity,
          price: price,
          total: itemTotal
        });
        
        subtotal += itemTotal;
      }
    });
    
    if (selectedDishes.length === 0) {
      $('#order-summary-content').html('<p>Add dishes to see your order details</p>');
      return;
    }
    
    // Calculate taxes
    var gstRate = 0.05; // 5% GST (2.5% CGST + 2.5% SGST)
    var cgst = subtotal * 0.025; // 2.5% CGST
    var sgst = subtotal * 0.025; // 2.5% SGST
    var totalGst = cgst + sgst;
    var total = subtotal + deliveryFee + totalGst;
    
    var summary = '';
    
    // Add each selected dish
    selectedDishes.forEach(function(dish) {
      summary += `
        <div class="dish-line">
          <span class="dish-name">${dish.name}</span>
          <span class="dish-qty">x${dish.quantity}</span>
          <span class="dish-price">₹${dish.total}</span>
        </div>
      `;
    });
    
    // Add subtotal, delivery fee, taxes, and total
    summary += `
      <div class="subtotal">
        <span>Subtotal:</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="delivery-fee">
        <span>Delivery Fee:</span>
        <span>₹${deliveryFee.toFixed(2)}</span>
      </div>
      <div class="tax-breakdown">
        <div class="tax-line">
          <span>CGST (2.5%):</span>
          <span>₹${cgst.toFixed(2)}</span>
        </div>
        <div class="tax-line">
          <span>SGST (2.5%):</span>
          <span>₹${sgst.toFixed(2)}</span>
        </div>
        <div class="tax-total">
          <span>Total GST (5%):</span>
          <span>₹${totalGst.toFixed(2)}</span>
        </div>
      </div>
      <div class="total">
        <span>Total Bill:</span>
        <span>₹${total.toFixed(2)}</span>
      </div>
    `;
    
    $('#order-summary-content').html(summary);
  }

  // Update summary when quantities change
  $('.qty-input').on('change input', updateOrderSummary);

  // ===== FORM SUBMISSION =====
  
  $('#order-form').submit(function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return false;
    }
    
    // Generate order ID
    var orderId = 'VD' + Date.now();
    
    // Collect order details and calculate totals
    var orderDetails = [];
    var subtotal = 0;
    var deliveryFee = 50;
    
    $('.qty-input').each(function() {
      var quantity = parseInt($(this).val()) || 0;
      if (quantity > 0) {
        var dishName = $(this).data('name');
        var price = parseInt($(this).data('price'));
        var itemTotal = price * quantity;
        
        orderDetails.push({
          dish: dishName,
          quantity: quantity,
          price: price,
          total: itemTotal
        });
        
        subtotal += itemTotal;
      }
    });
    
    // Calculate taxes
    var cgst = subtotal * 0.025;
    var sgst = subtotal * 0.025;
    var totalGst = cgst + sgst;
    var total = subtotal + deliveryFee + totalGst;
    
    // Show success message
    var successMessage = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i>
        <h3>Order Placed Successfully!</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Items:</strong> ${orderDetails.length} different dishes</p>
        <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
        <p><strong>Delivery Fee:</strong> ₹${deliveryFee.toFixed(2)}</p>
        <p><strong>CGST (2.5%):</strong> ₹${cgst.toFixed(2)}</p>
        <p><strong>SGST (2.5%):</strong> ₹${sgst.toFixed(2)}</p>
        <p><strong>Total GST:</strong> ₹${totalGst.toFixed(2)}</p>
        <p><strong>Total Bill:</strong> ₹${total.toFixed(2)}</p>
        <p>Thank you for choosing VegDelight!</p>
        <p>We'll deliver your order within the selected time.</p>
        <p>You'll receive a confirmation email shortly.</p>
      </div>
    `;
    
    // Replace form with success message
    $('#order-form').html(successMessage);
    
    // Scroll to top of form section
    $('html, body').animate({
      scrollTop: $('#order-form-section').offset().top - 70
    }, 500);
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  // Add scroll reveal animations for sections
  $(window).scroll(function() {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    
    $('.js--wp-1, .js--wp-2, .js--wp-3').each(function() {
      var elementTop = $(this).offset().top;
      
      if (scrollTop + windowHeight > elementTop + 100) {
        $(this).addClass('animated fadeInUp');
      }
    });
  });

  // ===== SCROLL-TRIGGERED IMAGE ANIMATIONS =====
  function checkScrollAnimations() {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var triggerOffset = 100; // Distance from bottom of viewport to trigger animation
    
    $('.scroll-animate').each(function(index) {
      var element = $(this);
      var elementTop = element.offset().top;
      var elementHeight = element.outerHeight();
      
      // Check if element is in viewport
      if (scrollTop + windowHeight > elementTop + triggerOffset && 
          scrollTop < elementTop + elementHeight - triggerOffset) {
        
        // Add delay based on element index for staggered effect
        var delay = (index % 6) * 0.1; // 0.1s delay between each element, cycles every 6 elements
        
        setTimeout(function() {
          element.addClass('animate-in');
        }, delay * 1000);
      }
    });
  }
  
  // Run on page load and scroll
  $(document).ready(function() {
    checkScrollAnimations();
  });
  
  $(window).scroll(function() {
    checkScrollAnimations();
  });
  
  // Throttle scroll events for better performance
  var scrollTimeout;
  $(window).scroll(function() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(function() {
      checkScrollAnimations();
    }, 10);
  });

  /* ===== STICKY NAVIGATION ===== */
  $('#features').waypoint(function(direction) {
    if (direction == "down") {
      $('nav').addClass('sticky');
    } else {
      $('nav').removeClass('sticky');
    }
  }, {
    offset: '60px'
  });
  
  /* ===== MOBILE NAVIGATION ===== */
  $('.js--nav-icon').click(function() {
    var nav = $('.js--main-nav');
    var icon = $('.js--nav-icon i');
    
    nav.slideToggle(200);
    
    if (icon.hasClass('ion-navicon-round')) {
      icon.addClass('ion-close-round');
      icon.removeClass('ion-navicon-round');
    } else {
      icon.addClass('ion-navicon-round');
      icon.removeClass('ion-close-round');
    }
  });
  
  /* ===== CONTACT FORM FUNCTIONALITY ===== */
  
  // Contact form validation
  function validateContactForm() {
    var isValid = true;
    
    // Clear previous errors
    $('.contact-form .error-message').text('');
    $('.contact-form .form-group input, .contact-form .form-group select, .contact-form .form-group textarea').removeClass('error');
    
    // Validate name
    var name = $('#contact-name').val().trim();
    if (name.length < 2) {
      $('#contact-name-error').text('Name must be at least 2 characters long');
      $('#contact-name').addClass('error');
      isValid = false;
    }
    
    // Validate email
    var email = $('#contact-email').val().trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#contact-email-error').text('Please enter a valid email address');
      $('#contact-email').addClass('error');
      isValid = false;
    }
    
    // Validate phone (optional but if provided, must be valid)
    var phone = $('#contact-phone').val().trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      $('#contact-phone-error').text('Please enter a valid 10-digit phone number');
      $('#contact-phone').addClass('error');
      isValid = false;
    }
    
    // Validate subject
    var subject = $('#contact-subject').val();
    if (!subject) {
      $('#contact-subject-error').text('Please select a subject');
      $('#contact-subject').addClass('error');
      isValid = false;
    }
    
    // Validate message
    var message = $('#contact-message').val().trim();
    if (message.length < 10) {
      $('#contact-message-error').text('Message must be at least 10 characters long');
      $('#contact-message').addClass('error');
      isValid = false;
    }
    
    return isValid;
  }
  
  // Contact form submission
  $('#contact-form').submit(function(e) {
    e.preventDefault();
    
    if (!validateContactForm()) {
      return false;
    }
    
    // Collect form data
    var formData = {
      name: $('#contact-name').val().trim(),
      email: $('#contact-email').val().trim(),
      phone: $('#contact-phone').val().trim(),
      subject: $('#contact-subject option:selected').text(),
      message: $('#contact-message').val().trim(),
      newsletter: $('#contact-newsletter').is(':checked')
    };
    
    // Show success message
    var successMessage = `
      <div class="contact-success">
        <i class="fas fa-check-circle"></i>
        <h3>Message Sent Successfully!</h3>
        <p>Thank you for contacting VegDelight!</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Reference:</strong> ${formData.subject}</p>
      </div>
    `;
    
    // Replace form with success message
    $('#contact-form').html(successMessage);
    
    // Scroll to top of contact section
    $('html, body').animate({
      scrollTop: $('#contact').offset().top - 70
    }, 500);
    
    // Log form data (in real app, this would be sent to server)
    console.log('Contact form submitted:', formData);
  });
  
  // Real-time validation for contact form
  $('#contact-name').on('blur', function() {
    var name = $(this).val().trim();
    if (name.length < 2) {
      $('#contact-name-error').text('Name must be at least 2 characters long');
      $(this).addClass('error');
    } else {
      $('#contact-name-error').text('');
      $(this).removeClass('error');
    }
  });
  
  $('#contact-email').on('blur', function() {
    var email = $(this).val().trim();
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      $('#contact-email-error').text('Please enter a valid email address');
      $(this).addClass('error');
    } else {
      $('#contact-email-error').text('');
      $(this).removeClass('error');
    }
  });
  
  $('#contact-phone').on('blur', function() {
    var phone = $(this).val().trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      $('#contact-phone-error').text('Please enter a valid 10-digit phone number');
      $(this).addClass('error');
    } else {
      $('#contact-phone-error').text('');
      $(this).removeClass('error');
    }
  });
  
  $('#contact-subject').on('change', function() {
    var subject = $(this).val();
    if (!subject) {
      $('#contact-subject-error').text('Please select a subject');
      $(this).addClass('error');
    } else {
      $('#contact-subject-error').text('');
      $(this).removeClass('error');
    }
  });
  
  $('#contact-message').on('blur', function() {
    var message = $(this).val().trim();
    if (message.length < 10) {
      $('#contact-message-error').text('Message must be at least 10 characters long');
      $(this).addClass('error');
    } else {
      $('#contact-message-error').text('');
      $(this).removeClass('error');
    }
  });
}); 