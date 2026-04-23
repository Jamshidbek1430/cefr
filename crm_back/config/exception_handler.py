from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    # If response is None, it means DRF didn't handle it
    # This happens for 500 errors or non-DRF exceptions
    if response is None:
        return Response(
            {'detail': 'Internal server error occurred.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Ensure 404 returns proper JSON
    if response.status_code == 404:
        response.data = {'detail': 'Not found.'}

    return response

