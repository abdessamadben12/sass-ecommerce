export const getTransaction = async (status, inputSearch, startDate, endDate, page, perPage, setError) => {
    return await axiosConfig.get("/admin/transactions", {
        params: {
            status: status,
            search: inputSearch,
            start_date: startDate,
            end_date: endDate,
            page: page,
            per_page: perPage
        }
    }).then(res => res.data)
    .catch(err => {
        setError(err.message);
    });
}