from django.utils.cache import patch_cache_control


class ServiceCacheControl:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.headers.get("Authorization") or request.path.startswith(
            ("/accounts/", "/grievances/", "/dashboard/", "/utility/")
        ):
            patch_cache_control(response, private=True, no_store=True)
        return response
