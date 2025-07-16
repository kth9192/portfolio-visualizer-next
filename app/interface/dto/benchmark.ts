export interface BenchmarkData{
    symbol:string;
    year_month:string;
    monthly_return:number;
    cumulative_value:number;
    close_price:number;
}

export const createBenchmarkData = (data: BenchmarkData): BenchmarkData => {
    return {
        symbol: data.symbol,
        year_month: data.year_month,
        monthly_return: data.monthly_return,
        cumulative_value: data.cumulative_value,
        close_price: data.close_price,
    }
}