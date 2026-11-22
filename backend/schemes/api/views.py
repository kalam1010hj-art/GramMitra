from django.db.models import Q
from django.utils import timezone
from config.api import Collection, Detail
from .serializers import SchemeSerializer


class Schemes:
    serializer = SchemeSerializer

    def records(self, request):
        rows = super().records(request)
        if (
            getattr(request.user, "role", None) != "admin"
            or request.query_params.get("manage") != "1"
        ):
            now = timezone.now()
            rows = (
                rows.filter(is_active=True)
                .filter(Q(start_date__isnull=True) | Q(start_date__lte=now))
                .filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
            )
        if request.query_params.get("category"):
            rows = rows.filter(category=request.query_params["category"])
        return rows.filter(name__icontains=request.query_params.get("search", ""))


class SchemeView(Schemes, Collection):
    pass


class SchemeDetailsView(Schemes, Detail):
    pass
