const test = require('node:test');
const assert = require('node:assert/strict');
const { app, readData } = require('./server');
const express = require('express');

const server = app.listen(0);

test('health endpoint returns ok', async () => {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
});

test('register and list products', async () => {
  const dataBefore = readData();
  const registerResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@example.com', password: '123456', role: 'artisan', location: 'Freetown' }),
  });
  const registerBody = await registerResponse.json();
  assert.equal(registerResponse.status, 201);
  assert.equal(registerBody.success, true);

  const productResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Handmade basket', description: 'Crafted locally', price: '50000', category: 'Crafts', location: 'Freetown', type: 'product', vendorEmail: 'test@example.com', vendorName: 'Test User' }),
  });
  const productBody = await productResponse.json();
  assert.equal(productResponse.status, 201);
  assert.equal(productBody.success, true);

  const listResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/products`);
  const listBody = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.ok(listBody.some((item) => item.title === 'Handmade basket'));

  const dataAfter = readData();
  assert.ok(dataAfter.users.length >= dataBefore.users.length);
});

test('login with seeded account works', async () => {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'buyer@marketplace.sl', password: 'buyer123' }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.user.role, 'buyer');
});

process.on('exit', () => server.close());