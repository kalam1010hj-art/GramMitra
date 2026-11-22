from django.db import transaction
from django.db.models import Prefetch
from config.api import Collection, Detail
from ..models import UtilitySchedule
from .serializers import UtitlitySerializer, UtilityScheduleSerializer


class Utilities:
    serializer = UtitlitySerializer

    def records(self, request):
        rows = super().records(request)
        schedules = UtilitySchedule.objects.order_by("start_time")
        if (
            getattr(request.user, "role", None) != "admin"
            or request.query_params.get("manage") != "1"
        ):
            rows = rows.filter(is_active=True)
            schedules = schedules.filter(is_active=True)
        return rows.prefetch_related(Prefetch("schedules", queryset=schedules))


class UtitlityView(Utilities, Collection):
    pass


class UtilityDetailsView(Utilities, Detail):
    pass


class Schedules:
    serializer = UtilityScheduleSerializer

    def records(self, request):
        rows = super().records(request)
        if (
            getattr(request.user, "role", None) != "admin"
            or request.query_params.get("manage") != "1"
        ):
            return rows.filter(is_active=True, utility__is_active=True)
        return rows

    @transaction.atomic
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class utilityScheduleView(Schedules, Collection):
    pass


class UtilityScheduleDetailsView(Schedules, Detail):
    pass
