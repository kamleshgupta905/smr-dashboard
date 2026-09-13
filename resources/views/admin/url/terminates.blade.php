<!DOCTYPE html>
<html lang="en-US">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VMH Groups - Terminated</title>
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

        @media (max-width: 599px) {
            .header {
                font-size: 16px;
                margin-top: 15px;
            }

            .subheader {
                font-size: 14px;
            }
        }
    </style>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
</head>

<body>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <img src="{{ asset('/assets/img/VMH.png') }}" alt="VMH Groups" style="height: 10rem; width: 10rem;">
            </div>
            <div class="col-md-12">
                <img src="{{ asset('/assets/img/terminated.png') }}" alt="Terminated"
                    style="width: 7rem; height: 7rem; margin-top: 20px;">
            </div>
        </div>
        <div class="header">The Event Has Been Terminated</div>
        <div class="subheader">We regret to inform you that this event has been terminated. We apologize for any
            inconvenience caused.</div>
        <div class="subheader">Thank you for your understanding. Please contact us if you have any questions or need
            further assistance.</div>
        @if(isset($userHitInfo))
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                               <th scope="col" class="text-center"><strong>Project Name</strong></th>
                            <th scope="col" class="text-center"><strong>Uid</strong></th>
                         
                            <th scope="col" class="text-center"><strong>Ip</strong></th>
                            <th scope="col" class="text-center"><strong>Status</strong></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>{{ $userHitInfo['name']??'' }}</strong></td>
                            <td><strong>{{ $userHitInfo['uid'] }}</strong></td>
                            <td><strong>{{ $userHitInfo['ip'] }}</strong></td>
                            <td><strong>{{ $userHitInfo['status'] }}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</body>

</html>
