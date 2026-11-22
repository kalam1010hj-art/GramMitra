from django.shortcuts import get_object_or_404
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination


class AdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class PublicReadAdminWrite(AdminOnly):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or super().has_permission(request, view)


class Pages(PageNumberPagination):
    page_size = 20


class Catalog(APIView):
    permission_classes = [PublicReadAdminWrite]

    def records(self, request):
        return self.serializer.Meta.model.objects.order_by("-pk")

    def get(self, request, pk=None):
        records = self.records(request)
        if pk is not None:
            return Response(
                self.serializer(
                    get_object_or_404(records, pk=pk), context={"request": request}
                ).data
            )
        if "page" in request.query_params:
            pages = Pages()
            rows = pages.paginate_queryset(records, request)
            return pages.get_paginated_response(
                self.serializer(rows, many=True, context={"request": request}).data
            )
        return Response(
            self.serializer(records, many=True, context={"request": request}).data
        )


class Collection(Catalog):
    def post(self, request):
        serializer = self.serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class Detail(Catalog):
    def put(self, request, pk):
        obj = get_object_or_404(self.records(request), pk=pk)
        serializer = self.serializer(
            obj, data=request.data, partial=request.method == "PATCH"
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    patch = put

    def delete(self, request, pk):
        get_object_or_404(self.records(request), pk=pk).delete()
        return Response(status=204)
