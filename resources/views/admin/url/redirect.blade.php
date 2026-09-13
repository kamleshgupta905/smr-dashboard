<!DOCTYPE html>
<html lang="en-US">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VMH Groups</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: 'Lato', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f9f9f9;
            text-align: center;
        }

        .container {
            border: 1px solid #e6e6e6;
            border-radius: 4px;
            padding: 30px;
            width: 85%;
            background-color: #fff;
        }

        .container img {
            max-width: 100%;
            height: auto;
        }

        .header {
            font-size: 24px;
            color: #333;
            font-weight: 700;
            line-height: 1.5;
            margin-top: 25px;
        }

        .subheader {
            font-size: 18px;
            color: #666;
            font-weight: 400;
            line-height: 1.5;
            margin: 10px 0;
        }

        .logos img {
            vertical-align: middle;
            margin: 20px 10px;
        }

        .redirect-message {
            border-top: 1px solid #e6e6e6;
            padding-top: 20px;
            margin-top: 20px;
            font-size: 13px;
            color: #333;
        }

        .redirect-message a {
            color: #0099cc;
            font-weight: 700;
            text-decoration: none;
        }

        @media (max-width: 599px) {
            .header {
                font-size: 16px;
                margin-top: 15px;
            }

            .subheader {
                font-size: 14px;
            }

            .logos img {
                width: 90px;
                margin: 15px 5px;
            }

            .redirect-message {
                font-size: 11px;
                margin-top: 15px;
                padding-top: 10px;
            }
        }
    </style>
</head>

<body>
    <div class="container" style="margin-top: 10rem;">
        <input type="hidden" id="redirecturl" value="{{ $liveRedirectUrl }}">
        <img src="{{ asset('/assets/img/redirect.png') }}" alt="Redirect" style="width: 7rem; height: 7rem;">
        <div class="header">Thank You For Agreeing To Participate In Our Survey</div>
        <div class="subheader">Your Opinions Are Important To Us, Kindly Provide Honest And Thoughtful Responses For Each
            Question In Order To Make Your Participation Count.</div>
        <div class="subheader">Your Responses Will Be Kept Confidential And Will Be Used In Aggregate Only.</div>
        <div class="logos">
            <img src="{{ asset('/assets/img/VMH.png') }}" alt="VMH" style="height: 10rem; width: 10rem;">
            <img src="{{ asset('/assets/img/intermediary_animation.gif') }}" alt="Loading">
            <img src="{{ asset('/assets/img/client.png') }}" alt="client" style="height: 55px; width: 55px;">
        </div>
        <div class="redirect-message">
            If you are not automatically re-directed, please <a href="{{ $liveRedirectUrl }}">click
                here</a>
        </div>
    </div>
</body>

</html>

<script src="{{ asset('assets/') }}/plugins/jquery/jquery.min.js"></script>
<script>
    $(document).ready(function() {
        setTimeout(function() {
            window.location.href = $("#redirecturl").val();
        }, 3000);
    });
</script>
