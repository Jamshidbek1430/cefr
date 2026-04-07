# # middleware.py
# from django.shortcuts import redirect

# class EnrollmentAccessMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         if request.user.is_authenticated:
#             if not request.user.enrollment_set.filter(status='active').exists():
#                 return redirect('payment_required')
#         return self.get_response(request)