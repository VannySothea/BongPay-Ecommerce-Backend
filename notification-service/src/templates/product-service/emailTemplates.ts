export const PAYMENT_SUCCESS_TEMPLATE = `
<h1>Payment Successful!</h1>
<p>Dear Customer,</p>
<p>Thank you for your order. Here are your order details:</p>

<h2>Order # {orderId}</h2>
<ul>
  {items}
</ul>

<p><strong>Total Amount:</strong> ${'{totalAmount}'} USD</p>
<p><strong>Payment Method:</strong> {paymentMethod}</p>
<p><strong>Status:</strong> {paymentStatus}</p>

<p>Shipping Address:</p>
<p>
{street}, {city}, {postalCode}, {country}<br/>
Phone: {phone}<br/>
Email: {email}
</p>

<p>Thank you for shopping with us!</p>
`;
