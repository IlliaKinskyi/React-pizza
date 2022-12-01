import React, { useCallback, useEffect, useRef } from 'react'
import PizzaBlock from '../components/PizzaBlock';
import Skeleton from '../components/PizzaBlock/Skeleton';
import Sort from '../components/Sort';
import Categories from '../components/Categories';
import Pagination from '../components/Pagination';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { selectFilter, setCategoryId, setCurrentPage, setFilters } from '../redux/slices/filterSlice'
import qs from 'qs'
import { sortList } from '../components/Sort'
import { fetchPizzas, SearchPizzaParams, selectPizzaData } from '../redux/slices/pizzaSlice';
import { useAppDispatch } from '../redux/store';

const Home: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isSearch = useRef(false)
  const isMounted = useRef(false)

  const { items, status } = useSelector(selectPizzaData)
  const { categoryId, sort, currentPage, searchValue } = useSelector(selectFilter)

  const onChangeCategory = useCallback((idx: number) => {
    dispatch(setCategoryId(idx))
  }, [])

  const onChangePage = (page: number) => {
    dispatch(setCurrentPage(page))
  }

  const getPizzas = async () => {
    const order = sort.sortProperty.includes('-') ? 'asc' : 'desc'
    const sortBy = sort.sortProperty.replace('-', '')
    const category = categoryId > 0 ? `category=${categoryId}` : ''
    const search = searchValue ? `&search=${searchValue}` : ''

    dispatch(
      fetchPizzas({
        order,
        sortBy,
        category,
        search,
        currentPage
    }))
    
    window.scrollTo(0, 0)
  }

  // Если изменили параметры и был первый рендер 
  useEffect(() => {
    if (isMounted.current) {
      const queryString = qs.stringify({
        sortProperty: sort.sortProperty,
        categoryId,
        currentPage
      })
  
      navigate(`?${queryString}`)
    }
    isMounted.current = true
  }, [categoryId, sort.sortProperty, currentPage])

  // Если был первый рендер, то проверяем URL параметры и сохраняем в redux
  useEffect(() => {
    if (window.location.search) {
      const params = (qs.parse(window.location.search.substring(1)) as unknown) as SearchPizzaParams
      const sort = sortList.find(obj => obj.sortProperty === params.sortBy)

      dispatch(
        setFilters({
          searchValue: params.search,
          categoryId: Number(params.category),
          currentPage: params.currentPage,
          sort: sort || sortList[0],
        }))
    }
    isSearch.current = true
  }, [])

  // Если был первый рендер, то запрашиваем пиццы
  useEffect(() => {
    getPizzas()

    isSearch.current = false

  }, [categoryId, sort.sortProperty, searchValue, currentPage])
 
  const pizzas = items.map((obj: any) => (
    <PizzaBlock 
    {...obj}
    key={obj.id}
    />))

  const skeletons = [...new Array(8)].map((_, index) => <Skeleton key={index}/>)

  return (
    <div className="container">
      <div className="content__top">
        <Categories value={categoryId} onChangeCategory={onChangeCategory} />
        <Sort value={sort} />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      {
        status === 'error' ? <div className="content__error-info">
          <h2>Произошла ошибка 😕</h2>
          <p>К сожалению, не удалось получить пиццы. Попробуйте повторить попытку позже.</p>
        </div> : <div className="content__items">
          {status === 'loading' 
          ? skeletons
          : pizzas
          }
      </div>
      }
      
      <Pagination currentPage={currentPage} onChangePage={onChangePage} />
    </div>
  );
};

export default Home;