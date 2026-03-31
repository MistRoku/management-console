<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        $companyName = 'My Company';
        $description = 'We are a leading company in our industry, providing top-notch services to our clients. Our mission is to deliver exceptional value and exceed customer expectations.';
        return view('about', [
            'companyName' => $companyName,
            'description' => $description,
        ]);
    }
}
