/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import {
  Container,
  CardContainer,
  Card,
  TableContainer,
  Touchable,
} from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface GetTransactionsResponse {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<GetTransactionsResponse>('/transactions');
      const formattedBalance: Balance = {
        income: formatValue(response.data.balance.income),
        outcome: formatValue(response.data.balance.outcome),
        total: formatValue(response.data.balance.total),
      };
      const formattedTransactions = response.data.transactions.map(
        transaction => {
          const formattedDate = new Date(
            transaction.created_at,
          ).toLocaleDateString();
          transaction.formattedDate = formattedDate;
          transaction.formattedValue = formatValue(transaction.value);
          return transaction;
        },
      );
      setTransactions(formattedTransactions);
      setBalance(formattedBalance);
    }

    loadTransactions();
  }, [transactions]);

  async function handleDeleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);

    const oldTransactions = [...transactions];
    const filteredTransactions = oldTransactions.filter(
      transaction => transaction.id !== id,
    );
    setTransactions(filteredTransactions);
  }

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td
                    className={
                      transaction.type === 'outcome' ? 'outcome' : 'income'
                    }
                  >
                    {transaction.type === 'outcome' && '- '}
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                  <td>
                    <Touchable
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      <FiTrash2 size={30} color="#c03030" />
                    </Touchable>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
