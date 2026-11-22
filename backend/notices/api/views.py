from django.db.models import Q
from django.utils import timezone
from config.api import Collection, Detail
from .serializers import NoticeSerializer


class Notices:
    serializer = NoticeSerializer

    def records(self, request):
        rows = super().records(request)
        if (
            getattr(request.user, "role", None) != "admin"
            or request.query_params.get("manage") != "1"
        ):
            rows = rows.filter(is_published=True).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            )
        if request.query_params.get("noticeTricker"):
            rows = rows.filter(Q(display_it=True) | Q(is_important=True))
        if request.query_params.get("category"):
            rows = rows.filter(category=request.query_params["category"])
        return rows.filter(title__icontains=request.query_params.get("search", ""))


class NoticeView(Notices, Collection):
    pass


class NoticeDetailsView(Notices, Detail):
    pass
